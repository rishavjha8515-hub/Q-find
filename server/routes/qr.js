// server/routes/qr.js
const express = require("express");
const router = express.Router();
const { LANDMARKS, LANDMARKS_PUBLIC } = require("../../shared/landmark");
const {
  generateHash,
  validateHash,
  buildQRData,
  secondsUntilNextWindow,
  getTimeWindow,
} = require("../../shared/crypto");

// IMPORTANT: Static routes MUST come before dynamic routes
// GET /api/qr/landmarks - MUST BE FIRST
router.get("/landmarks", (req, res) => {
  res.json({ landmarks: LANDMARKS_PUBLIC });
});

// GET /api/qr/:landmarkId - comes AFTER /landmarks
router.get("/:landmarkId", (req, res) => {
  const { landmarkId } = req.params;
  const lm = LANDMARKS.find((l) => l.id === landmarkId.toUpperCase());

  if (!lm) {
    return res.status(404).json({ error: `Landmark '${landmarkId}' not found` });
  }

  const hash = generateHash(lm.id, lm.secret);
  const qrData = buildQRData(lm.id, lm.secret);
  const expiresIn = secondsUntilNextWindow();

  res.json({
    landmarkId: lm.id,
    name: lm.name,
    zone: lm.zone,
    qrData,
    hash,
    expiresIn,
    window: getTimeWindow(),
  });
});

// POST /api/qr/validate
router.post("/validate", (req, res) => {
  const { hash, landmarkId, teamId } = req.body;

  if (!hash || !landmarkId) {
    return res.status(400).json({ error: "hash and landmarkId are required" });
  }

  const lm = LANDMARKS.find((l) => l.id === landmarkId.toUpperCase());
  if (!lm) {
    return res.status(404).json({ error: `Landmark '${landmarkId}' not found` });
  }

  const result = validateHash(hash, lm.id, lm.secret);

  if (result.valid) {
    console.log(`✓ Valid check-in: Team ${teamId || "unknown"} at ${lm.name}`);
    return res.json({
      valid: true,
      message: `Check-in confirmed at ${lm.name}`,
      landmark: { id: lm.id, name: lm.name, zone: lm.zone },
      teamId: teamId || null,
    });
  }

  console.log(`✗ Invalid hash attempt at ${lm.name} (window ${result.window})`);
  res.status(401).json({
    valid: false,
    message: "Hash is expired or invalid. Code rotates every 60 seconds.",
    window: result.window,
  });
});

module.exports = router;