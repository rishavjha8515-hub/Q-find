const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two coordinates usimg Havershine formula 
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} 
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2-lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2 );

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = EARTH_RADIUS_KM * c;

    return distance;
}

/**
 * Check if a position is within radius of a landmrak
 * @param {object} position 
 * @param {object} landmark
 * @param {object} radiusKm
 * @returns {boolean}
 */
function isWithRadius(position, landmark, radiusKm = 0.1) {
    if (!position || !landmark ) return false;

    const distance = haversineDistance(
        position.lat,
        position.lng,
        landmark.lat,
        landmark.lng
    );

    return distance <= radiusKm;
}

/**
 * Used for qubit perburbation
 * @param {object} position
 * @param {object} landmark
 * @returns {number}
 */
function proximityScore(position, landmark) {
    if (!position || !landmark) return0;

    const distance = haversineDistance(
        position.lat,
        position.lng,
        landmark.lat,
        landmark.lng
    );

    const score = Math.exp(-distance);

    return score;
}

/**
 * Calculate movement speed (km/hr)
 * @param {object} pos1
 * @param {object} pos2
 * @returns {number}
 */
function calculateSpeed(pos1, pos2) {
    if (!pos1 || !pos2 || !pos1.timestamp || !pos2.timestamp) return0;

    const distance = haversineDistance(pos1.lat, pos1.lng, pos2.lat, pos2.lng);
    const timeHours = (pos2.timestamp - pos1.timestamp) / (1000 * 60 *60);

    if (timeHours === 0) return 0;

    return distance / timeHours;
}

    module.exports = {
        haversineDistance,
        isWithRadius,
        proximityScore,
        calculateSpeed,
        EARTH_RADIUS_KM,
    };
