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

router.get("/:landmarkId", (req, res) => {
    res.json({ landmarks: LANDMARKS_PUBLIC });
});

router.get("/:landmarkId/qr", (req, res) => {
    const lm = LANDMARKS.find (
        (l) => l.id === req.params.landmarkId.toUpperCase()
    );
    if (!lm) return res.status(404).json({ error: "Landmark not found"});

    res.json({
        landmarkId: lm.id,
        name: lm.name,
        zone: lm.zone,
        qrData: buildQRData(lm.id, lm.secret),
        hash: generateHash(lm.id, lm.secret),
        expiresIn: secondsUntilNextWindow(),
        window: getTimeWindow(),
    });
});

router.post("/validate", (req, res0) => {
    const { hash, landmarkId, teamID } = req.body;
if (!hash || !landmarkId )
return res.status(400).json({ error: "hash and landmarkId required"});

const lm = LANDMARKS.find(
    (l) => l.id === landmarkId.toUpperCase()
);
if (!lm) return res.status(404).json({ error: "Landmark not found"});

const result = validateHash(hash, lm.id, lm.secret);

if (result.valid) {
    return res.json({
        valid: true,
        message: `Check-in confirmed at ${lm.name}`,
        landmark: { id: lm.id, name: lm.name, zone: lm.zone },
    });
}

res.status(401).json({ 
    valid: false,
    message: "Hash expired or invalid.Codes rotate every 60 seconds.",
});
});

module.exports = router;