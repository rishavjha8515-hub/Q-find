import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import "./Scanner.css";

const API = "http://localhost:3000";

export function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const scanIntervalRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // rear camera
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

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
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

    // Validate with backend
    try {
      // We need to get the full hash from the backend first
      const qrRes = await fetch(`${API}/api/qr/${landmarkId}`);
      const qrInfo = await qrRes.json();
      
      const res = await fetch(`${API}/api/qr/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash: qrInfo.hash, // use full hash from server
          landmarkId,
          teamId: "SCANNER_TEST"
        })
      });
      
      const data = await res.json();
      setResult(data);
      
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
      scanIntervalRef.current = setInterval(scanFrame, 300); // scan every 300ms
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

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h2>📱 QR Scanner</h2>
        <p>Point your camera at a Q-Find QR code</p>
      </div>

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
            Camera captures frames every 300ms → jsQR decodes QR → Backend validates hash
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Hash window:</span>
          <span className="info-text">
            Accepts ±1 minute for clock drift (3 valid windows total)
          </span>
        </div>
      </div>
    </div>
  );
}