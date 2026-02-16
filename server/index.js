require ("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:5173"}));
app.use(express.json());

const qrRoutes = require("./routes/qr");
app.use("/api/qr", qrRoutes);

app.get("/api/health", (req, res) => {
    res.json({ 
        status: "online",
        project: "Q-Find",
        timestamp: new Date().toISOString(),
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('\n⬡ Q-Find server running on http://localhost:${PORT}');
    console.log(' Health: http://localhost:${PORT}/api/health');
    console.log(' QR API: http://localhost:${PORT}/api/:landmarId\n');
})