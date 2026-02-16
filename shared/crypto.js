// shared/crypto.js
const crypto = require("crypto");

function getTimeWindow() {
  return Math.floor(Date.now() / 1000 / 60);
}

function secondsUntilNextWindow() {
  return 60 - (Math.floor(Date.now() / 1000) % 60);
}

function generateHash(landmarkId, secret, window) {
  if (window === undefined) window = getTimeWindow();
  const payload = landmarkId + ":" + window;
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

function validateHash(inputHash, landmarkId, secret) {
  const currentWindow = getTimeWindow();
  const windowsToCheck = [currentWindow - 1, currentWindow, currentWindow + 1];

  const valid = windowsToCheck.some(function(w) {
    const expected = generateHash(landmarkId, secret, w);
    try {
      return crypto.timingSafeEqual(
        Buffer.from(inputHash.toLowerCase(), "hex"),
        Buffer.from(expected, "hex")
      );
    } catch (e) {
      return false;
    }
  });

  return { valid: valid, window: currentWindow };
}

function buildQRData(landmarkId, secret) {
  const hash = generateHash(landmarkId, secret);
  return "QFIND|" + landmarkId + "|" + hash.slice(0, 32).toUpperCase();
}

module.exports = {
  getTimeWindow: getTimeWindow,
  secondsUntilNextWindow: secondsUntilNextWindow,
  generateHash: generateHash,
  validateHash: validateHash,
  buildQRData: buildQRData,
};