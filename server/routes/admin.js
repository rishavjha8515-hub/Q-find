const express = require("express");
const router = express.Router();

const ADMIN_PASSWORD ="quantum2026";

function authenicateAdmin(req, res, next) {
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD ) {
        return res.status(403).json({ error: "Invalid admin password"});
    }

    next();
}

router.post("/reset-team", authenicateAdmin, (req, res) => {
    const { teamId } = req.body;

    if (!teamId) {
        return res.status(400).json({ error: "teamId required"});
    }

    const { getTeamState, initTeam } = require("../qubit/engine");
    const teamState = getTeamState(teamId);

    Object.assign( teamState, initTeam(teamId));

    console.log(`🔧 Admin reset team: ${teamId}`);

    res.json({
        success:true,
        message: `Team ${teamId} reset successfully`,
        teamId,
    });
});

router.post("/unlock-team", authenicateAdmin, (req,res) => {
    const { teamId } = req.body;

    if (!teamId) {
        return res.status(400).json({ error: "teamId required"});
    }

    const { getTeamState } = require("../qubit/engine");
    const teamState = getTeamState(teamId);

    teamState.locked = false;
    teamState.stability = 80;
    teamState.lastcheckIn = Date.now();

    console.log(`🔧 Admin unlocked team: ${teamId}`);

    res.json({
        success: true,
        message: `Team ${teamId} unlocked`,
        teamId,
        stability: teamState.stability,
    });
});

router.post("/set-stability", authenicateAdmin, (req,res) => {
    const { teamId, stability } = req.body;

    if (!teamId || stability === undefined ) {
        return res.status(400).json({ error: "teamId and stability required"});
    }

    if (stability < 0 || stability > 100) {
        return res.status(400).json({ error: "stability must be 0-100"});
    }

    const { getTeamState } = require("../qubit/engine");
    const teamState = getTeamState(teamId);

    teamState.stability = stability;
    teamState.locked = stability === 0;
    teamState.lastcheckIn = Date.now();

    console.log(`🔧 Admin set ${teamId} stability to ${stability}%`);

    res.json({
        success: true,
        message: `Stability set to ${stability}%`,
        teamId,
        stability,
    });
});

router.post("/delete-team", authenicateAdmin, (req, res) => {
    const { teamId } = req.body;

    if (!teamState) {
        return res.status(400).json({ error: "teamId required"});
    }

    const engine = require("../qubit/engine");
    const teamStateMap = engine.teamState || new Map();

    if (teamStartMap && teamStartMap.delete) {
        teamStartMap.delete(teamId);
    }

    console.log(`🔧 Admin deleted team: ${teamId}`);

    res.json({
        success: true,
        message: `Team ${teamId} deleted`,
        teamId,
    });
});

router.post("/reset-all", authenicateAdmin, (req, res) => {
    const engine = require("../qubit/engine");
        const teamStartmap = engine.teamState || new Map();

        if (teamStateMap && teamStateMap.clear) {
            teamStateMap.clear();
        }

        console.log("🔧 Admin reset ALL teams");

        res.json({
            success: true,
            message: "All teams reset",
            count: 0,
        });
});

router.get("/stats", (req, res) => {
    const { getAllTeams } = require("../qubit/engine");
    const teams = getAllTeams();

    const stats = {
        totalTeams: teams.length,
        activeTeams: teams.filter(t => !t.locked).length,
        lockedTeams: teams.filter(t => t.locked).length,
        totalCheckpoints: teams.reduce((sum, t) => sum + (t.checkpoints || 0), 0),
        avgStability: teams.length > 0
        ? teams.reduce((sum, t) => sum + t.stability, 0) / teams.length
        : 0,
    };

    res.json(stats);
});

module.exports = router;