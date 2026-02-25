// shared/powerups.js
// Power-ups for extended gameplay

const POWERUPS = [
  {
    id: "gamma_reducer",
    name: "Quantum Stabilizer",
    description: "Reduce γ by 50% for 5 minutes",
    icon: "🛡️",
    duration: 300000, // 5 minutes in ms
    effect: { type: "gamma_multiplier", value: 0.5 },
    cost: 3, // checkpoints required
  },
  {
    id: "instant_restore",
    name: "Hadamard Gate",
    description: "Instantly restore stability to 100%",
    icon: "⚡",
    duration: 0, // instant
    effect: { type: "instant_restore", value: 100 },
    cost: 5,
  },
  {
    id: "checkpoint_multiplier",
    name: "Entanglement Boost",
    description: "Next check-in gives +40% instead of +20%",
    icon: "🌟",
    duration: 600000, // 10 minutes
    effect: { type: "checkin_multiplier", value: 2.0 },
    cost: 2,
  },
  {
    id: "freeze_decay",
    name: "Quantum Zeno Effect",
    description: "Freeze decoherence for 3 minutes",
    icon: "❄️",
    duration: 180000, // 3 minutes
    effect: { type: "freeze_decay", value: true },
    cost: 4,
  },
  {
    id: "radar",
    name: "Quantum Radar",
    description: "Reveal nearest 3 unclaimed landmarks",
    icon: "📡",
    duration: 300000, // 5 minutes
    effect: { type: "reveal_landmarks", value: 3 },
    cost: 2,
  },
];

/**
 * Check if team can afford a powerup
 */
function canAffordPowerup(teamCheckpoints, powerupId) {
  const powerup = POWERUPS.find((p) => p.id === powerupId);
  if (!powerup) return false;
  return teamCheckpoints >= powerup.cost;
}

/**
 * Apply a powerup to team state
 */
function applyPowerup(teamState, powerupId) {
  const powerup = POWERUPS.find((p) => p.id === powerupId);
  if (!powerup) {
    return { success: false, message: "Invalid powerup" };
  }

  if (teamState.checkpoints.length < powerup.cost) {
    return {
      success: false,
      message: `Not enough checkpoints. Need ${powerup.cost}, have ${teamState.checkpoints.length}`,
    };
  }

  // Initialize active powerups array
  if (!teamState.activePowerups) {
    teamState.activePowerups = [];
  }

  // Apply effect
  const now = Date.now();
  const expiresAt = powerup.duration > 0 ? now + powerup.duration : null;

  switch (powerup.effect.type) {
    case "instant_restore":
      teamState.stability = 100;
      teamState.locked = false;
      break;

    case "gamma_multiplier":
      teamState.activePowerups.push({
        id: powerup.id,
        name: powerup.name,
        appliedAt: now,
        expiresAt,
        effect: powerup.effect,
      });
      break;

    case "checkin_multiplier":
    case "freeze_decay":
    case "reveal_landmarks":
      teamState.activePowerups.push({
        id: powerup.id,
        name: powerup.name,
        appliedAt: now,
        expiresAt,
        effect: powerup.effect,
      });
      break;
  }

  console.log(`⚡ Team ${teamState.teamId} activated powerup: ${powerup.name}`);

  return {
    success: true,
    message: `${powerup.icon} ${powerup.name} activated!`,
    powerup: {
      id: powerup.id,
      name: powerup.name,
      expiresAt,
    },
  };
}

/**
 * Remove expired powerups
 */
function cleanExpiredPowerups(teamState) {
  if (!teamState.activePowerups) return;

  const now = Date.now();
  teamState.activePowerups = teamState.activePowerups.filter((p) => {
    if (p.expiresAt === null) return false; // instant powerups
    return p.expiresAt > now;
  });
}

/**
 * Calculate effective gamma with powerups
 */
function getEffectiveGamma(teamState, baseGamma) {
  if (!teamState.activePowerups) return baseGamma;

  let gamma = baseGamma;

  for (const powerup of teamState.activePowerups) {
    if (powerup.effect.type === "gamma_multiplier") {
      gamma *= powerup.effect.value;
    } else if (powerup.effect.type === "freeze_decay") {
      gamma = 0; // No decay
    }
  }

  return gamma;
}

/**
 * Get checkin bonus with powerups
 */
function getCheckinBonus(teamState) {
  let bonus = 20; // Base bonus

  if (!teamState.activePowerups) return bonus;

  for (const powerup of teamState.activePowerups) {
    if (powerup.effect.type === "checkin_multiplier") {
      bonus *= powerup.effect.value;
    }
  }

  return bonus;
}

module.exports = {
  POWERUPS,
  canAffordPowerup,
  applyPowerup,
  cleanExpiredPowerups,
  getEffectiveGamma,
  getCheckinBonus,
};