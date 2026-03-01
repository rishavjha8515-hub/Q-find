import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://192.168.126.148/ws";

export function useWebsocket(teamId = null) {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [teamState, setTeamState ] = useState(null);
    const [allteams, setAllTeams] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
        try {
            const ws = new  WebSocket(WS_URL);
            ws.Ref.current = ws;

            ws.onopen = () => {
                console.log("✓ WebSocket connected");
                setConnected(true);

                if (teamId) {
                    ws.send(JSON.stringify({
                        type:"SUBSCRIBE",
                        teamId,
                    }));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastMessage(message);

                    switch (message.type) {
                        case "QUBIT_UPDATE":
                            if (message.teamId === teamId) {
                                setTeamState(message.state);
                            }
                            break;


                            case "ALL_TEAMS_UPDATE":
                                setAllTeams(message.teams || [] );
                                break;

                                case "TEAM_STATE":
                                    if (message.teamId === teamId) {
                                        setTeamState(message.state);
                                    }
                                    break;

                                    case "CONNECTED":
                                        console.log(message.message);
                                        break;

                                        case "PONG":
                                            // Heartbeat response
                                            break;

                                            default:
                                                console.log("Received:", message.type);
                    }
                } catch (err) {
                    console.error("Websocket message parse error:", err);
                }
            };

            ws.onerror = (error) => {
                console.error("Websocket error:", error);
            };

            ws.onclose = () => {
                console.log("✗ WebSocket disconnected");
                setConnected(false);
                wsRef.current = null;

                reconnectTimeoutRef.current = setTimeout(()  => {
                    console.log("Reconnecing...");
                    connect();
                }, 5000);
            };
        } catch(err) {
            console.error("WebSocket connection error:", err);
        }
    }, [teamId]);
    
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setConnected(false);
    }, []);

    const send = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket not connected");
        }
    }, []);

    const requestState = useCallback (() => {
        send({ type: "REQUEST_DATA", teamId});
    }, [send, teamId]);

    useEffect(() => {
        if (!connected) return;

        const interval = setInterval(() => {
            send({ type:"PING"});
        }, 30000);

        return () => clearInterval(interval);
    }, [connected, send]);

    return {
        connected,
        teamState,
        allteams,
        lastMessage,
        send,
        requestState,
        disconnect
    };
}