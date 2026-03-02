import { useState, useEffect } from "react";
import soundSystem from "/utils/sounds";
import "./SettingsPanel.css";

export function SettingsPanel({ onClose }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [haptics, setHaptics] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("q-find-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      setSoundEnabled(settings.soundEnabled ?? true);
      setVolume(settings.volume ?? 0.3);
      setHaptics(settings.haptics ?? true);
      setHighContrast(settings.highContrast ?? false);
      setReducedMotion(settings.reducedMotion ?? false);

      soundSystem.enabled = settings.soundEnabled ?? true;
      soundSystem.setVolume(settings.volume ?? 0.3);
    }
  }, []);

  const saveSettings = (newSettings) => {
    const settings = {
      soundEnabled,
      volume,
      haptics,
      highContrast,
      reducedMotion,
      ...newSettings,
    };
    localStorage.setItem("q-find-settings", JSON.stringify(settings));
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    soundSystem.toggle();
    saveSettings({ soundEnabled: newValue });
    if (newValue) soundSystem.click();
  };

  const changeVolume = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundSystem.setVolume(newVolume);
    saveSettings({ volume: newVolume });
  };

  const toggleHaptics = () => {
    const newValue = !haptics;
    setHaptics(newValue);
    saveSettings({ haptics: newValue });
    if (newValue && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    saveSettings({ highContrast: newValue });
    document.body.classList.toggle("high-contrast", newValue);
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    saveSettings({ reducedMotion: newValue });
    document.body.classList.toggle("reduced-motion", newValue);
  };

  const testSound = () => {
    soundSystem.scanSuccess();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ SETTINGS</h2>
          <button className="settings-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-body">
          {/* Sound Settings */}
          <div className="settings-section">
            <div className="section-title">🔊 SOUND</div>

            <div className="setting-row">
              <div className="setting-label">
                <span>Enable Sound Effects</span>
                <span className="setting-desc">Audio feedback for actions</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={toggleSound}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {soundEnabled && (
              <>
                <div className="setting-row">
                  <div className="setting-label">
                    <span>Volume</span>
                    <span className="setting-desc">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={changeVolume}
                  className="volume-slider"
                  />
                  </div>

                  <button className="test-button" onClick={testSound}>
                    🎵 Test Sound
                  </button>
                  </>
            )}
            </div>

            {/* Haptics */}
            <div className="settings-section">
                <div className="section-label">📳 HAPTICS</div>

            <div className="setting-row">
                <div className="setting-label">
                    <span>Vibration Feedback</span>
                    <span className="setting-disc">Vibrate on imortant events</span>
                    </div>
                    <label className="toggle">
                        <input
                        type="checkbox"
                        checked={haptics}
                        onChange={toggleHaptics}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            {/* Accessibility */}
            <div className="settings-section">
                <div className="section-title">♿ ACCESSIBILITY</div>

                <div className="setting-row">
                    <div className="setting-label">
                        <span>High Contrast</span>
                        <span className="setting-desc">Increase color contrast</span>
                    </div>
                    <label className="toggle">
                        <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={toggleHighContrast}
                        />
                        <span className="toggle-slider"></span> 
                    </label>
                </div>

                <div className="setting-row">
                    <div className="setting-label">
                        <span>Reduce Motion</span>
                        <span className="setting-desc">Minimize animations</span> 
                        </div> 
                        <label className="toggle">
                            <input
                            type="checkbox"
                            checked={reducedMotion}
                            onChange={toggleReducedMotion}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                </div>
            </div>

            {/* Info */}
            <div className="settings-section">
                <div className="section-title">ℹ️ ABOUT</div>
                <div className="info-text">
                    <div className="info-row">
                        <span>Version:</span>
                        <span>1.0.0</span>
                    </div>
                    <div className="info-row">
                        <span>Build:</span>
                        <span>Q-Find Manhattan 2026</span>
                        </div> 
                        <div className="info-row">
                            <span>Decoherence:</span>
                            <span>γ = 0.02 s⁻¹</span>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="settings-footer">
                    <button className="settings-done" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
  );
}