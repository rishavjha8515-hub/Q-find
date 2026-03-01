import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Scanner } from "./components/Scanner";
import { QubitStatus } from "./components/QubitStatus";
import { TeamDashboard } from "./components/TeamDashboard";
import { Analytics } from "./components/Analytics";
import { AdminPanel } from "./components/AdminPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { GPSTracker } from "./components/GPSTracker";
import soundSystem from "./utils/sounds";
import "./App.css";

const API = "http://192.168.126.148:3000"; // UPDATE WITH YOUR IP

function App() {
  const [tab, setTab] = useState("generator");
  const [landmarks, setLandmarks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);

  // Load landmarks on mount
  useEffect(() => {
    fetch(`${API}/api/qr/landmarks`)
      .then((r) => r.json())
      .then((d) => {
        setLandmarks(d.landmarks || []);
        if (d.landmarks && d.landmarks.length > 0) {
          setSelected(d.landmarks[0].id);
        }
      })
      .catch((e) => console.error("Failed to load landmarks:", e));
  }, []);

  // Fetch QR data when landmark changes
  useEffect(() => {
    if (!selected || tab !== "generator") return;
    fetchQR();
  }, [selected, tab]);

  // Countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const secs = 60 - (Math.floor(Date.now() / 1000) % 60);
      setCountdown(secs);
      if (secs === 60 && selected && tab === "generator") {
        fetchQR();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selected, tab]);

  const fetchQR = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/qr/${selected}`);
      const data = await res.json();
      setQrData(data);
    } catch (e) {
      console.error("Failed to fetch QR:", e);
    }
    setLoading(false);
  };

  const changeTab = (newTab) => {
    setTab(newTab);
    soundSystem.click();
  };

  const lm = landmarks.find((l) => l.id === selected);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⬡ Q-FIND</div>
        <div className="subtitle">Quantum Scavenger Hunt · NYC</div>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          ⚙️
        </button>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === "generator" ? "active" : ""}`}
          onClick={() => changeTab("generator")}
        >
          <span className="tab-icon">🖼️</span>
          <span className="tab-label">Generator</span>
        </button>
        <button
          className={`tab ${tab === "scanner" ? "active" : ""}`}
          onClick={() => changeTab("scanner")}
        >
          <span className="tab-icon">📱</span>
          <span className="tab-label">Scanner</span>
        </button>
        <button
          className={`tab ${tab === "qubit" ? "active" : ""}`}
          onClick={() => changeTab("qubit")}
        >
          <span className="tab-icon">⚛️</span>
          <span className="tab-label">Qubit</span>
        </button>
        <button
          className={`tab ${tab === "dashboard" ? "active" : ""}`}
          onClick={() => changeTab("dashboard")}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Leaderboard</span>
        </button>
        <button
          className={`tab ${tab === "analytics" ? "active" : ""}`}
          onClick={() => changeTab("analytics")}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Analytics</span>
        </button>
        <button
          className={`tab ${tab === "gps" ? "active" : ""}`}
          onClick={() => changeTab("gps")}
        >
          <span className="tab-icon">📍</span>
          <span className="tab-label">GPS</span>
        </button>
        <button
          className={`tab ${tab === "admin" ? "active" : ""}`}
          onClick={() => changeTab("admin")}
        >
          <span className="tab-icon">🔧</span>
          <span className="tab-label">Admin</span>
        </button>
      </nav>

      <main className="main">
        {tab === "generator" && (
          <>
            <div className="card">
              <h2>Select Landmark</h2>
              <div className="landmark-grid">
                {landmarks.map((landmark) => (
                  <div
                    key={landmark.id}
                    className={`landmark-card ${selected === landmark.id ? "active" : ""}`}
                    onClick={() => {
                      setSelected(landmark.id);
                      soundSystem.click();
                    }}
                  >
                    <div className="lm-id">{landmark.id}</div>
                    <div className="lm-name">{landmark.name}</div>
                    <div className="lm-zone">{landmark.zone}</div>
                  </div>
                ))}
              </div>
            </div>

            {lm && (
              <div className="card qr-card">
                <div className="qr-header">
                  <h2>{lm.name}</h2>
                  <span className="zone-badge">{lm.zone}</span>
                </div>

                {loading ? (
                  <div className="loading">Generating hash...</div>
                ) : qrData ? (
                  <>
                    <div className="qr-container">
                      <QRCode value={qrData.qrData} size={200} />
                    </div>

                    <div className="countdown-section">
                      <div className="countdown-label">Code expires in</div>
                      <div className="countdown-timer">{countdown}s</div>
                      <div className="countdown-bar">
                        <div
                          className="countdown-fill"
                          style={{ width: `${(countdown / 60) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="hash-section">
                      <div className="hash-label">QR DATA STRING</div>
                      <div className="hash-value">{qrData.qrData}</div>
                    </div>

                    <div className="hash-section">
                      <div className="hash-label">FULL SHA-256 HASH</div>
                      <div className="hash-value hash-mono">{qrData.hash}</div>
                    </div>

                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-label">Time Window</div>
                        <div className="stat-value">{qrData.window}</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Landmark ID</div>
                        <div className="stat-value">{qrData.landmarkId}</div>
                      </div>
                    </div>

                    <button className="refresh-btn" onClick={fetchQR}>
                      ⟳ Regenerate Hash
                    </button>
                  </>
                ) : (
                  <div className="empty">Select a landmark to generate QR code</div>
                )}
              </div>
            )}
          </>
        )}

        {tab === "scanner" && (
          <div className="card">
            <Scanner />
          </div>
        )}

        {tab === "qubit" && (
          <div className="card">
            <QubitStatus />
          </div>
        )}

        {tab === "dashboard" && (
          <div className="card">
            <TeamDashboard />
          </div>
        )}

        {tab === "analytics" && (
          <div className="card">
            <Analytics />
          </div>
        )}

        {tab === "gps" && (
          <div className="card">
            <div className="gps-section">
              <GPSTracker onLocationUpdate={setGpsLocation} />
              
              {gpsLocation && (
                <div className="gps-info-panel">
                  <h3>📍 Current Location</h3>
                  <div className="gps-details">
                    <div className="gps-detail-row">
                      <span>Coordinates:</span>
                      <span>{gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}</span>
                    </div>
                    <div className="gps-detail-row">
                      <span>Accuracy:</span>
                      <span>±{Math.round(gpsLocation.accuracy)}m</span>
                    </div>
                    <div className="gps-detail-row">
                      <span>Timestamp:</span>
                      <span>{new Date(gpsLocation.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="gps-features">
                <h3>🎯 GPS Features</h3>
                <ul className="feature-list">
                  <li>✓ Proximity-based qubit perturbation</li>
                  <li>✓ Movement speed detection</li>
                  <li>✓ Distance-based decay modifiers</li>
                  <li>✓ Near-landmark stability bonuses</li>
                  <li>✓ Anti-cheat driving detection</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "admin" && (
          <div className="card">
            <AdminPanel />
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="checkpoint">
          ✓ Q-Find Complete: 20 Landmarks · GPS · WebSocket · Analytics · Admin · Sound · Mobile
        </div>
      </footer>

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;