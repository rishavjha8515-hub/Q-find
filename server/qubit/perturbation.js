const { proximityScore, calculateSpeed, haversineDistance } = require("../../shared/havershine");
const { LANDMARKS } = require("../../shared/landmark");

/**
 * Calculate gamma modifier based on team's GPS behavior
 * Idle teams get higher decoherence
 * Moving teams get environmental perturbation
 */
function calculateGammaModifier(teamState) {
    let modifier = 1.0;

    const now = Date.now();
    const idleTimeSeconds = (now - teamState.lastCheckIn) / 1000;

    // 1. Idle Penalty: Teams sitting still decay faster
  // After 5 minutes idle: +50% decay rate
  if (idleTimeSeconds > 300) {
    const idleMinutes = idleTimeSeconds / 60;
    modifier += 0.1 * Math.log(idleMinutes);
  }

  // 2. Movement Perturbation: Fast movement causes instability
  if (teamState.positionHistory && teamState.positionHistory.length >= 2) {
    const recentPositions  = teamState.positionHistory.slice(-2);
    const speed = calculateSpeed(recentPositions[0], recentPositions[1]);

     // Walking speed (5 km/h): no penalty
    // Running speed (15 km/h): +30% decay
    // Driving speed (50 km/h): +100% decay (they're cheating!)
    if (speed >5 ) {
        modifier += (speed - 5) / 50;
    }
  }

  // 3. Distance Penalty: Far from nearest landmark
  if (teamState.lastPosition) {
    const nearestLandmark = findNearestLandmark(teamState.lastPosition);
     if (nearestLandmark) {
        const distance = haversineDistance(
            teamState.lastPosition.lat,
            teamState.lastPosition.lng,
            nearestLandmark.lat,
            nearestLandmark.lng
        );

         // More than 2km from any landmark: +20% decay
         if (distance > 2) {
            modifier += 0.2;
         }
     }
  }

  // 4. Proximity Bonus: Very close to unclaimed landmark
  if (teamState.lastPosition) {
    const nearestUnclaimed = findNearestUnclaimedLandmark(
        teamState.lastPosition,
        teamState.checkpoints
    );

    if (nearestUnclaimed) {
        const score = promixityScore(teamState.lastPosition, nearestUnclaimed);

      // Within 100m of unclaimed landmark: -20% decay
      if (score > 0.9) {
     modifier -= 0.2;  
    }
  }
}
// Clamp between 0.5x and 3.0x
  return Math.max(0.5, Math.min(3.0, modifier));
}

/**
 * Find nearest landmark to a position
 */
function findNearestLandmark(position) {
    if (!position) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const lm of LANDMARKS) {
        const distance = haversineDistance(
            position.lat,
            position.lng,
            lm.lat,
            lm.lng
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearest = lm;  
        }
    }

    return nearest;
}

/**
 * Find nearest landmark that team hasn't claimed yet
 */
function findNearestUnclaimedLandmark(position, checkpoints = []) {
    if (!position) return null;

    const claimedIds = new Set(checkpoints.map((cp) => cp.landmarkId));

    let nearest = null;
    let minDistance = Infinity;

    for (const lm of LANDMARKS) {
        if (claimedIds.has(lm.id)) continue;

        const distance = haversineDistance(
            position.lat,
            position.lng,
            lm.lat,
            lm.lng
        );

        if (distance < minDistance) {
            minDistance = distance;
            nearest = lm;
        }
    }

    return nearest
}

/**
 * Apply perturbation to team state
 */
function applyPerturbation(teamState) {
    const modifier = calculateGammaModifier(teamstate);
    const baseGamma = 0.02;

    teamState.gamma = baseGamma * modifier;

    return {
        gamma: teamState.gamma,
        modifier,
        perturbationType: describePerturbation(modifier),
    };
}

/**
 * Human-readable perturbation description
 */
function describePerturbation(modifier) {
    if (modifier < 0.8) return "proximity_bonus";
    if (modifier < 1.2) return "normal";
    if (modifier < 1.5) return "idle-penalty";
    if (modifier < 2.0) return "movement_perturbation";
    return "high_instability";
}

module.exports = {
    calculateGammaModifier,
    findNearestLandmark,
    findNearestUnclaimedLandmark,
    applyPerturbation,
};
