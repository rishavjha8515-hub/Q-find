require ("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "*" }));
app.use(express.json());

const qrRoutes = require("./routes/qr");
const qubitRoutes = require("./routes/qubit");

app.use("/api/qubit", qubitRoutes);
app.use("/api/qr", qrRoutes);

app.get("/api/health", (req, res) => {
    res.json({ 
        status: "online",
        project: "Q-Find",
        module: "Qubit Engine",
        timestamp: new Date().toISOString(),
    });
});

const { getAllTeams } = require("./qubit/engine");
const { initWebSocket } = require("./ws/websocket");

initWebSocket(server);

setInterval(() => {
    const teams = getAllTeams();
    if (teams.length > 0) {
        console.log(`\n⬡ Qubit Tick — ${teams.length} teams active`);
        teams.forEach(team => {
            if (team.stability < 30 && team.stability > 0) {
                console.log(`  ⚠ Team ${team.teamId}: ${team.stability}% stability (WARNING)`);
            } else if (team.locked) {
                console.log(`🔒 Team ${team.teamId}: LOCKED (decoherence)`);
            }
            });
    }
}, 5000); // Every 5 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n⬡ Q-Find server running on http://localhost:${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(` QR API: http://localhost:${PORT}/api/:landmarkId\n`);
    console.log(` Qubit API: http://localhost:${PORT}/api/qubit/:teamId\n`);
    console.log(`\n   Qubit decay tick: every 5 seconds`);
    console.log(`   Decoherence constant γ = 0.02 s⁻¹\n`);
});

module.exports = { app, server };