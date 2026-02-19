import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "./components/Scanner";
import "./App.css";

const API = "http://localhost:3000";

function App() {
  const [tab, setTab] = useState("generator"); // "generator" or "scanner"
  const [landmarks, setLandmarks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

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
      // Auto-refresh when window expires
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

  const lm = landmarks.find((l) => l.id === selected);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⬡ Q-FIND</div>
        <div className="subtitle">Day 5 · QR Scanner</div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === "generator" ? "active" : ""}`}
          onClick={() => setTab("generator")}
        >
          🖼️ QR Generator
        </button>
        <button
          className={`tab ${tab === "scanner" ? "active" : ""}`}
          onClick={() => setTab("scanner")}
        >
          📱 QR Scanner
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
                    onClick={() => setSelected(landmark.id)}
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
                      <QRCodeSVG value={qrData.qrData} size={200} level="M" />
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
      </main>

      <footer className="footer">
        <div className="checkpoint">
          ✓ Day 5 Complete: Phone camera QR scanner · Real-time validation · Ready for Manhattan
        </div>
      </footer>
    </div>
  );
}

export default App;