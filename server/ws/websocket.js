const WebSocket = require("ws");
const { getAllTeams, tickDecay } = require("../qubit/engine");

let wss = null;
const clients = new Map(); // Map<teamId, Set<WebSocket>>

/**
 * Initialize WebSocket server
 */
function initWebSocket(server) {
  wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    console.log("✓ WebSocket client connected");

    let subscribedTeamId = null;

    // Handle messages from client
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, message, subscribedTeamId);

        if (message.type === "SUBSCRIBE" && message.teamId) {
          subscribedTeamId = message.teamId;
          
          // Track client by team
          if (!clients.has(subscribedTeamId)) {
            clients.set(subscribedTeamId, new Set());
          }
          clients.get(subscribedTeamId).add(ws);
          
          console.log(`✓ Client subscribed to team: ${subscribedTeamId}`);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });

    // Handle disconnect
    ws.on("close", () => {
      if (subscribedTeamId && clients.has(subscribedTeamId)) {
        clients.get(subscribedTeamId).delete(ws);
        if (clients.get(subscribedTeamId).size === 0) {
          clients.delete(subscribedTeamId);
        }
      }
      console.log("✗ WebSocket client disconnected");
    });

    // Send initial state
    ws.send(JSON.stringify({
      type: "CONNECTED",
      message: "Connected to Q-Find real-time server",
      timestamp: Date.now(),
    }));
  });

  // Broadcast qubit updates every 5 seconds
  setInterval(() => {
    broadcastQubitUpadets();
  }, 5000);

  console.log("✓ WebSocket server initialized on /ws");
}

/**
 * Handle incoming messages
 */
function handleMessage(ws, message, currentTeamId) {
  switch (message.type) {
    case "SUBSCRIBE":
      // Already handled in connection handler
      break;

    case "PING":
      ws.send(JSON.stringify({ type: "PONG", timestamp: Date.now() }));
      break;

    case "REQUEST_STATE":
      const teamId = message.teamId || currentTeamId;
      if (teamId) {
        const state = tickDecay(teamId);
        ws.send(JSON.stringify({
          type: "TEAM_STATE",
          teamId,
          state,
          timestamp: Date.now(),
        }));
      }
      break;

      case "CHAT_MESSAGE":
        broadcastToTeam(message.teamId, message);
        break;

        case "USER_TYPING":
          broadcastToTeam(message.teamId, message)
          break;

    default:
      console.log("Unknown message type:", message.type);
  }
}

/**
 * Broadcast qubit updates to all connected clients
 */
function broadcastQubitUpadets() {
    const teams = getAllTeams();


    // Send to team-specific subscribers
    for (const[teamId, teamClients] of clients.entries()) {
        const teamData = teams.find((t) => t.teamId === teamId);
        if (!teamData) continue;
 
        const message = JSON.stringify({
            type:  "QUBIT_UPDATE",
           teamId,
           state: teamData,
           timestamp: Date.now(), 
        });

        teamClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Broadcast all teams to global listeners
  const globalMessage = JSON.stringify({
    type: "ALL_TEAMS_UPDATE",
    teams,
    timestamp: Date.now(),
  });


  wss.clients.forEach((client) =>{
    if (client.readyState === WebSocket.OPEN) {
        //Only send to clients not subscribed to specific teams
        let isGlobalClient = true;
        for (const [, teamClients] of clients.entries()) {
            if (teamClients.has(client)) {
                isGlobalClient = false;
                break;
            }
        }
        if (isGlobalClient) {
          client.send(globalMessage);
        }
    }
  });
}

/**
 * Send event to specific team subscribers
 */
function sendToTeam(teamId, eventType, data) {
  const teamClients = clients.get(teamId);
  if (!teamClients) return;

  const message =  JSON.stringify({
    type: eventType,
    teamId,
    data,
    timestamp: Date.now(),
  });

  teamClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Broadcast event to all clinets 
 */
function broadcast(eventType, data) {
  if(!wss) return;

   const message = JSON.stringify({
    type:eventType,
    data,
    timestamp: Date.now(),
   });

   wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
   });
}

module.exports = {
  initWebSocket,
  sendToTeam,
  broadcast,
};
