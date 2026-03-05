

const ACHIEVEMENTS = [
  {
    id: "first_scan",
    name: "First Steps",
    description: "Complete your first check-in",
    icon: "🎯",
    requirement: { type: "checkpoints", value: 1 },
    reward: { type: "points", value: 50 },
  },
  {
    id: "five_scans",
    name: "Getting Started",
    description: "Complete 5 check-ins",
    icon: "⭐",
    requirement: { type: "checkpoints", value: 5 },
    reward: { type: "points", value: 100 },
  },
  {
    id: "ten_scans",
    name: "Explorer",
    description: "Complete 10 check-ins",
    icon: "🗺️",
    requirement: { type: "checkpoints", value: 10 },
    reward: { type: "powerup", value: "instant_restore" },
  },
  {
    id: "all_zones",
    name: "Borough Hopper",
    description: "Visit all 8 zones",
    icon: "🌆",
    requirement: { type: "unique_zones", value: 8 },
    reward: { type: "points", value: 500 },
  },
  {
    id: "speedrun",
    name: "Quantum Speedster",
    description: "Complete 5 check-ins in under 1 hour",
    icon: "⚡",
    requirement: { type: "speed", value: { count: 5, time: 3600000 } },
    reward: { type: "powerup", value: "freeze_decay" },
  },
  {
    id: "survival",
    name: "Decoherence Survivor",
    description: "Maintain >50% stability for 30 minutes",
    icon: "🛡️",
    requirement: { type: "stability_duration", value: { threshold: 50, duration: 1800000 } },
    reward: { type: "points", value: 250 },
  },
  {
    id: "puzzle_master",
    name: "Error Correction Master",
    description: "Solve 5 error correction puzzles",
    icon: "🧩",
    requirement: { type: "puzzles_solved", value: 5 },
    reward: { type: "powerup", value: "gamma_reducer" },
  },
  {
    id: "brooklyn_explorer",
    name: "Brooklyn Adventurer",
    description: "Complete all Brooklyn landmarks",
    icon: "🌉",
    requirement: { type: "zone_complete", value: "Brooklyn" },
    reward: { type: "points", value: 300 },
  },
  {
    id: "midnight_runner",
    name: "Night Owl",
    description: "Complete a check-in between midnight and 6 AM",
    icon: "🌙",
    requirement: { type: "time_range", value: { start: 0, end: 6 } },
    reward: { type: "points", value: 150 },
  },
  {
    id: "perfect_stability",
    name: "Quantum Perfectionist",
    description: "Reach 100% stability",
    icon: "💎",
    requirement: { type: "max_stability", value: 100 },
    reward: { type: "points", value: 100 },
  },
];

/**
 * Check if achievement is unlocked
 */
function checkAchievement(teamState, achievementId) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return false;

  const { type, value } = achievement.requirement;

  switch (type) {
    case "checkpoints":
      return teamState.checkpoints.length >= value;

    case "unique_zones":
      const uniqueZones = new Set(
        teamState.checkpoints.map((cp) => {
          // Find landmark zone
          const LANDMARKS = require("./landmarks-extended").LANDMARKS;
          const lm = LANDMARKS.find((l) => l.id === cp.landmarkId);
          return lm ? lm.zone : null;
        }).filter(Boolean)
      );
      return uniqueZones.size >= value;

    case "speed":
      if (teamState.checkpoints.length < value.count) return false;
      const recentCheckpoints = teamState.checkpoints.slice(-value.count);
      const timeSpan =
        recentCheckpoints[recentCheckpoints.length - 1].timestamp -
        recentCheckpoints[0].timestamp;
      return timeSpan <= value.time;

    case "stability_duration":
      // Would need time-series tracking - simplified check
      return teamState.stability >= value.threshold;

    case "puzzles_solved":
      return (teamState.puzzlesSolved || 0) >= value;

    case "zone_complete":
      const LANDMARKS = require("./landmarks-extended").LANDMARKS;
      const zoneLandmarks = LANDMARKS.filter((l) => l.zone === value);
      const completedIds = new Set(teamState.checkpoints.map((cp) => cp.landmarkId));
      return zoneLandmarks.every((lm) => completedIds.has(lm.id));

    case "time_range":
      const lastCheckpoint = teamState.checkpoints[teamState.checkpoints.length - 1];
      if (!lastCheckpoint) return false;
      const hour = new Date(lastCheckpoint.timestamp).getHours();
      return hour >= value.start && hour < value.end;

    case "max_stability":
      return teamState.stability >= value;

    default:
      return false;
  }
}

/**
 * Get all unlocked achievements for a team
 */
function getUnlockedAchievements(teamState) {
  if (!teamState.unlockedAchievements) {
    teamState.unlockedAchievements = [];
  }

  const unlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    if (teamState.unlockedAchievements.includes(achievement.id)) {
      continue; // Already unlocked
    }

    if (checkAchievement(teamState, achievement.id)) {
      teamState.unlockedAchievements.push(achievement.id);
      unlocked.push(achievement);
      console.log(`🏆 Team ${teamState.teamId} unlocked: ${achievement.name}`);
    }
  }

  return unlocked;
}

module.exports = {
  ACHIEVEMENTS,
  checkAchievement,
  getUnlockedAchievements,
};