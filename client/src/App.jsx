import { useState, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';
import "./App.css";

const API = "http://localhost:3000";

function App() {
  const [landmarks, setLandmarks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

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

  useEffect(() => {
    if (!selected) return;
    fetchQR();
  }, [selected]);

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = 60 - (Math.floor(Date.now() / 1000) % 60);
      setCountdown(secs);
      if (secs === 60 && selected) {
        fetchQR();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selected]);

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
        <div className="subtitle">Day 2 · QR Generator</div>
      </header>

      <main className="main">
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
                <div className="lm-location">{landmark.location}</div>
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
      </main>
    </div>
  );
}

export default App;