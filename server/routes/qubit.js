// server/routes/qubit.js
// Qubit management API endpoints

const express = require("express");
const router = express.Router();
const {
  getTeamState,
  tickDecay,
  handleCheckIn,
  restoreQubit,
  getAllTeams,
} = require("../qubit/engine");
const { getRandomPuzzle, validateAnswer } = require("../../shared/puzzles");

// GET /api/qubit/:teamId - Get team's current qubit state
router.get("/:teamId", (req, res) => {
  const { teamId } = req.params;
  const state = tickDecay(teamId);
  res.json(state);
});

// GET /api/qubit/all/teams - Get all teams' states (for dashboard)
router.get("/all/teams", (req, res) => {
  const teams = getAllTeams();
  res.json({ teams });
});

// POST /api/qubit/checkin - Handle check-in and update qubit
router.post("/checkin", (req, res) => {
  const { teamId, landmarkId, position } = req.body;
  
  if (!teamId || !landmarkId) {
    return res.status(400).json({ error: "teamId and landmarkId required" });
  }
  
  const result = handleCheckIn(teamId, landmarkId, position);
  res.json(result);
});

// GET /api/qubit/puzzle/random - Get a random error correction puzzle
router.get("/puzzle/random", (req, res) => {
  const puzzle = getRandomPuzzle();
  res.json(puzzle);
});

// POST /api/qubit/puzzle/validate - Validate puzzle answer
router.post("/puzzle/validate", (req, res) => {
  const { teamId, puzzleId, answerIndex } = req.body;
  
  if (teamId === undefined || puzzleId === undefined || answerIndex === undefined) {
    return res.status(400).json({ error: "teamId, puzzleId, and answerIndex required" });
  }
  
  const result = validateAnswer(puzzleId, answerIndex);
  
  if (result.valid) {
    // Restore the qubit
    const restoreResult = restoreQubit(teamId);
    res.json({
      ...result,
      ...restoreResult,
    });
  } else {
    res.json(result);
  }
});

module.exports = router;