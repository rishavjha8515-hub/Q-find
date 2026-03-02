// client/src/utils/sounds.js
// Audio feedback system using Web Audio API

class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Play a beep tone
   */
  beep(frequency = 440, duration = 100, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  /**
   * QR Scan success sound
   */
  scanSuccess() {
    this.init();
    // Happy ascending tones
    this.beep(523.25, 100); // C5
    setTimeout(() => this.beep(659.25, 100), 100); // E5
    setTimeout(() => this.beep(783.99, 150), 200); // G5
  }

  /**
   * QR Scan failure sound
   */
  scanFail() {
    this.init();
    // Descending error tones
    this.beep(392.00, 100, 'square'); // G4
    setTimeout(() => this.beep(329.63, 200, 'square'), 100); // E4
  }

  /**
   * Qubit lock warning
   */
  lockWarning() {
    this.init();
    // Urgent beeps
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.beep(880, 80, 'sawtooth'), i * 150);
    }
  }

  /**
   * Puzzle solved sound
   */
  puzzleSolved() {
    this.init();
    // Victory fanfare
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.50]; // C-D-E-G-C
    notes.forEach((freq, i) => {
      setTimeout(() => this.beep(freq, 120), i * 100);
    });
  }

  /**
   * Achievement unlocked sound
   */
  achievement() {
    this.init();
    // Bright ascending chord
    const chord = [523.25, 659.25, 783.99]; // C-E-G major chord
    chord.forEach((freq) => {
      this.beep(freq, 400);
    });
    setTimeout(() => this.beep(1046.50, 600), 300); // High C
  }

  /**
   * Stability warning (low stability)
   */
  stabilityWarning() {
    this.init();
    this.beep(220, 200, 'triangle'); // Low warning tone
  }

  /**
   * Button click sound
   */
  click() {
    this.init();
    this.beep(800, 30);
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.click();
    }
    return this.enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

// Singleton instance
const soundSystem = new SoundSystem();

export default soundSystem;