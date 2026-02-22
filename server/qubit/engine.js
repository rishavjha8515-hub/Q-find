const GAMMA = 0.02;
const THERMAL_NOISE_RANGE = 0.05;

const teamState = new Map ();

/** 
* Initialize a new team's qubit state 
 */

function initTeam(teamId) {
    const state = {
        teamId,
        stability: 100,
        lastCheckIn: Date.now(),
        lastPosition: null,
        checkpoints: [],
        gamma: GAMMA,
        locked: false,
        totalIdleTime: 0,
        createdAt: Date.now(),
    };

    teamState.set(teamId, state);
    console.log(`✓ Team ${teamId} initialized with qubit stability 100%`);
  return state;
}
/** 
 Get team state (create if doesn't exist)
    */

    function getTeamState(teamId) {
        if (!teamState.has(teamId)) {
            return initTeam(teamId);
        }
        return teamState.get(teamId);
    }

    /**
    * Calculate current stability using P(t) = e^(-γt)
 */

    function calculateStability(state) {
        if (state.locked) return 0;
        
        const elaspedSeconds = (Date.now() - state.lastCheckIn) / 1000;

        // base decay: P(t) = e^(-γt)

        const baseStability = Math.exp(-state.gamma * elaspedSeconds * 100);

        // add thermal noise
        const noise = (Math.random() - 0.5) * 2 * THERMAL_NOISE_RANGE * 100;

         // Clamp between 0-100
  const currentStability = Math.max(0, Math.min(100, baseStability + noise));
  
  // Auto-lock if below 1%
  if (currentStability < 1 && !state.locked) {
    state.locked = true;
    state.stability = 0;
    console.log(`⚠ Team ${state.teamId} qubit decoherence — scanner LOCKED`);
  } else {
    state.stability = currentStability;
  }
  
  return currentStability;
}

/**
 * Decay tick — called every 5 seconds by the server
 */
function tickDecay(teamId) {
  const state = getTeamState(teamId);
  const newStability = calculateStability(state);
  
  // Track idle time
  const idleSeconds = (Date.now() - state.lastCheckIn) / 1000;
  state.totalIdleTime = idleSeconds;
  
  return {
    teamId,
    stability: Math.round(newStability * 10) / 10, // 1 decimal place
    locked: state.locked,
    idleTime: Math.round(idleSeconds),
    gamma: state.gamma,
  };
}

/**
 * Handle successful check-in at a landmark
 */
function handleCheckIn(teamId, landmarkId, position = null) {
  const state = getTeamState(teamId);
  
  if (state.locked) {
    return {
      success: false,
      message: "Scanner locked due to decoherence. Solve error correction puzzle first.",
      stability: 0,
      locked: true,
    };
  }
  
  // Reset decay clock on successful check-in
  state.lastCheckIn = Date.now();
  state.lastPosition = position;
  state.checkpoints.push({
    landmarkId,
    timestamp: Date.now(),
    stability: state.stability,
  });
  
  // Partial stability boost on check-in (20% bonus)
  state.stability = Math.min(100, state.stability + 20);
  
  console.log(`✓ Team ${teamId} checked in at ${landmarkId} — stability: ${Math.round(state.stability)}%`);
  
  return {
    success: true,
    message: `Check-in confirmed. Stability restored to ${Math.round(state.stability)}%`,
    stability: Math.round(state.stability * 10) / 10,
    locked: false,
    checkpoints: state.checkpoints.length,
  };
}

/**
 * Restore qubit after solving error correction puzzle
 */
function restoreQubit(teamId) {
  const state = getTeamState(teamId);
  
  if (!state.locked) {
    return {
      success: false,
      message: "Qubit is not locked.",
    };
  }
  
  // Restore to 80% (partial recovery)
  state.stability = 80;
  state.locked = false;
  state.lastCheckIn = Date.now(); // Reset decay clock
  
  console.log(`✓ Team ${teamId} solved error correction — stability restored to 80%`);
  
  return {
    success: true,
    message: "Error correction successful. Qubit restored to 80%.",
    stability: 80,
    locked: false,
  };
}

/**
 * Get all team states (for dashboard)
 */
function getAllTeams() {
  const teams = [];
  for (const [teamId, state] of teamState) {
    teams.push({
      teamId,
      stability: Math.round(calculateStability(state) * 10) / 10,
      locked: state.locked,
      checkpoints: state.checkpoints.length,
      idleTime: Math.round((Date.now() - state.lastCheckIn) / 1000),
    });
  }
  return teams;
}

/**
 * Increase decoherence rate (environmental perturbation)
 */
function applyPerturbation(teamId, factor = 1.5) {
  const state = getTeamState(teamId);
  state.gamma = GAMMA * factor;
  console.log(`⚡ Team ${teamId} environmental perturbation — γ increased to ${state.gamma}`);
}

/**
 * Reset decoherence rate to normal
 */
function resetPerturbation(teamId) {
  const state = getTeamState(teamId);
  state.gamma = GAMMA;
}

module.exports = {
  initTeam,
  getTeamState,
  calculateStability,
  tickDecay,
  handleCheckIn,
  restoreQubit,
  getAllTeams,
  applyPerturbation,
  resetPerturbation,
  GAMMA,
};