// Q-Find Backend — Express + Qubit Decoherence System

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://q-find.vercel.app', // YOUR VERCEL URL
        /\.vercel\.app$/,
        'http://localhost:5173'
      ]
    : "*"
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
const qrRoutes = require("./routes/qr");
const qubitRoutes = require("./routes/qubit");
const adminRoutes = require("./routes/admin");

app.use("/api/qr", qrRoutes);
app.use("/api/qubit", qubitRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    project: "Q-Find",
    module: "Production",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ── WebSocket ─────────────────────────────────────────────────────────────────
const { initWebSocket } = require("./ws/websocket");
initWebSocket(server);

// ── Qubit Decay Tick Loop ────────────────────────────────────────────────────
const { getAllTeams } = require("./qubit/engine");

setInterval(() => {
  const teams = getAllTeams();
  if (teams.length > 0) {
    console.log(`\n⬡ Qubit Tick — ${teams.length} teams active`);
    teams.forEach(team => {
      if (team.stability < 30 && team.stability > 0) {
        console.log(`  ⚠ Team ${team.teamId}: ${team.stability}% stability (WARNING)`);
      } else if (team.locked) {
        console.log(`  🔒 Team ${team.teamId}: LOCKED (decoherence)`);
      }
    });
  }
}, 5000);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n⬡  Q-Find server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   QR API:       http://localhost:${PORT}/api/qr/:landmarkId`);
  console.log(`   Qubit API:    http://localhost:${PORT}/api/qubit/:teamId`);
  console.log(`\n   Qubit decay tick: every 5 seconds`);
  console.log(`   Decoherence constant γ = 0.02 s⁻¹\n`);
});

module.exports = { app, server };