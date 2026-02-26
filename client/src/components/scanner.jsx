import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import "./Scanner.css";

const API = "http:// 172.24.150.148:3000"; // UPDATE WITH YOUR IP

export function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [teamId, setTeamId] = useState("TEAM_TEST");
  const [qubitStatus, setQubitStatus] = useState(null);
  const scanIntervalRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraReady(true);
        setScanning(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
    setScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  // Scan QR code from video frame
  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code && code.data) {
      handleQRDetected(code.data);
    }
  };

  // Handle detected QR code
  const handleQRDetected = async (qrData) => {
    console.log("QR detected:", qrData);
    
    // Parse QR data: "QFIND|LANDMARK_ID|HASH_PREFIX"
    const parts = qrData.split("|");
    if (parts.length !== 3 || parts[0] !== "QFIND") {
      setResult({
        valid: false,
        message: "Invalid QR format. Expected Q-Find landmark code."
      });
      return;
    }

    const [, landmarkId, hashPrefix] = parts;

    // Stop scanning while validating
    setScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    // Check if qubit is locked
    try {
      const qubitRes = await fetch(`${API}/api/qubit/${teamId}`);
      const qubitData = await qubitRes.json();
      
      if (qubitData.locked) {
        setResult({
          valid: false,
          message: "🔒 Scanner locked due to decoherence. Solve error correction puzzle first.",
          qubitStatus: qubitData
        });
        setTimeout(() => {
          setResult(null);
          setScanning(true);
        }, 3000);
        return;
      }
    } catch (err) {
      console.error("Qubit check error:", err);
    }

    // Get full hash from backend and validate
    try {
      const qrRes = await fetch(`${API}/api/qr/${landmarkId}`);
      const qrInfo = await qrRes.json();
      
      const res = await fetch(`${API}/api/qr/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash: qrInfo.hash,
          landmarkId,
          teamId
        })
      });
      
      const data = await res.json();
      
      if (data.valid) {
        // Trigger qubit check-in
        const checkinRes = await fetch(`${API}/api/qubit/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            landmarkId,
            position: { lat: 0, lng: 0 } // Could use geolocation API here
          })
        });
        
        const checkinData = await checkinRes.json();
        
        setResult({
          ...data,
          qubitStatus: checkinData
        });
      } else {
        setResult(data);
      }
      
      // Auto-resume scanning after 3 seconds
      setTimeout(() => {
        setResult(null);
        setScanning(true);
      }, 3000);
      
    } catch (err) {
      console.error("Validation error:", err);
      setResult({
        valid: false,
        message: "Network error. Is the backend running?"
      });
    }
  };

  // Scan loop
  useEffect(() => {
    if (scanning && cameraReady) {
      scanIntervalRef.current = setInterval(scanFrame, 300);
    }
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [scanning, cameraReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Fetch qubit status periodically
  useEffect(() => {
    const fetchQubit = async () => {
      try {
        const res = await fetch(`${API}/api/qubit/${teamId}`);
        const data = await res.json();
        setQubitStatus(data);
      } catch (err) {
        console.error("Failed to fetch qubit:", err);
      }
    };

    fetchQubit();
    const interval = setInterval(fetchQubit, 5000);
    return () => clearInterval(interval);
  }, [teamId]);

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h2>📱 QR Scanner</h2>
        <p>Point your camera at a Q-Find QR code</p>
      </div>

      {/* Team ID Input */}
      <div className="team-input-section">
        <label>Team ID:</label>
        <input
          type="text"
          className="team-input"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          disabled={cameraReady}
        />
      </div>

      {/* Qubit Status Display */}
      {qubitStatus && (
        <div className={`qubit-status-bar ${qubitStatus.locked ? "locked" : ""}`}>
          <div className="qubit-status-label">Qubit Stability:</div>
          <div className="qubit-status-bar-fill">
            <div
              className="qubit-status-fill"
              style={{ width: `${qubitStatus.stability}%` }}
            />
          </div>
          <div className="qubit-status-value">
            {Math.round(qubitStatus.stability)}%
          </div>
          {qubitStatus.locked && <span className="lock-badge">🔒 LOCKED</span>}
        </div>
      )}

      {error && (
        <div className="scanner-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <div className="camera-container">
        {!cameraReady && !error && (
          <div className="camera-placeholder">
            <button className="start-camera-btn" onClick={startCamera}>
              📷 Start Camera
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          className="camera-feed"
          playsInline
          muted
          style={{ display: cameraReady ? "block" : "none" }}
        />
        
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {cameraReady && (
          <div className="scanner-overlay">
            <div className="scanner-frame">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
            </div>
            {scanning && (
              <div className="scan-line"></div>
            )}
          </div>
        )}
      </div>

      {result && (
        <div className={`result-card ${result.valid ? "valid" : "invalid"}`}>
          <div className="result-icon">
            {result.valid ? "✓" : "✗"}
          </div>
          <div className="result-message">{result.message}</div>
          {result.valid && result.landmark && (
            <div className="result-details">
              <div className="result-landmark">{result.landmark.name}</div>
              <div className="result-zone">{result.landmark.zone}</div>
            </div>
          )}
          {result.qubitStatus && (
            <div className="result-qubit">
              <div className="qubit-info">
                Stability: <strong>{Math.round(result.qubitStatus.stability)}%</strong>
              </div>
              <div className="qubit-info">
                Checkpoints: <strong>{result.qubitStatus.checkpoints}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {cameraReady && (
        <div className="scanner-controls">
          <button className="control-btn stop" onClick={stopCamera}>
            ⏹ Stop Camera
          </button>
          <div className="scanner-status">
            <span className={`status-dot ${scanning ? "active" : ""}`}></span>
            {scanning ? "Scanning..." : "Paused"}
          </div>
        </div>
      )}

      <div className="scanner-info">
        <div className="info-item">
          <span className="info-label">How it works:</span>
          <span className="info-text">
            Scan QR → Validate hash → Update qubit stability (+20% boost)
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Locked scanner:</span>
          <span className="info-text">
            If stability hits 0%, solve error correction puzzle to unlock
          </span>
        </div>
      </div>
    </div>
  );
}