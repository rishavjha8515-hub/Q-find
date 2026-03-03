const express= require("express");
const router = express.Router();

const  photos = new Map();

router.post("/submit", (req, res) => {
    const { teamId, landmarkId, photo, timestamp} =  req.body;

    if (!photos.has(teamId)) {
        photos.set(teamId, []);
    }

    photos.get(teamId).push({
        landmarkId,
        photo,
        timestamp,
    });

    res.json({ sucess:true, count: photos.get(teamId).length });
});

router.get("/:teamId", (req,res) => {
    const teamPhotos = photos.get(req.params.teamId) || [];
    res.json({ photos: teamPhotos });
});

module.exports = router;