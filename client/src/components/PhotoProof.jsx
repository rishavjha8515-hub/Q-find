// Camera component for taking photos at landmarks as proof

import { useState, useRef } from "react";
import "./PhotoProof.css";

const API = "https://q-find-backend.onrender.com"; 

export function PhotoProof({ teamId, landmarkId, landmarkName, onPhotoSubmitted }) {
  const [mode, setMode] = useState("camera"); 
  const [photo, setPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setStream(mediaStream);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL("image/jpeg", 0.8);
    setPhoto(photoData);
    setMode("preview");
    stopCamera();
  };

  const retake = () => {
    setPhoto(null);
    setMode("camera");
    startCamera();
  };

  const submitPhoto = async () => {
    setUploading(true);
    
    try {
      const res = await fetch(`${API}/api/photos/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          landmarkId,
          photo,
          timestamp: Date.now()
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMode("submitted");
        onPhotoSubmitted && onPhotoSubmitted(data);
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Network error. Try again.");
    }
    
    setUploading(false);
  };

  return (
    <div className="photo-proof">
      <div className="photo-header">
        <h3>📸 Photo Proof</h3>
        <p>Take a selfie at {landmarkName}!</p>
      </div>

      {mode === "camera" && (
        <div className="camera-mode">
          {!stream ? (
            <button className="start-camera" onClick={startCamera}>
              📷 Start Camera
            </button>
          ) : (
            <>
              <div className="video-container">
                <video ref={videoRef} autoPlay playsInline muted />
                <div className="camera-overlay">
                  <div className="camera-frame"></div>
                </div>
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div className="camera-controls">
                <button className="capture-btn" onClick={capturePhoto}>
                  📷 Capture
                </button>
                <button className="cancel-btn" onClick={stopCamera}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === "preview" && photo && (
        <div className="preview-mode">
          <img src={photo} alt="Captured" className="photo-preview" />
          <div className="preview-controls">
            <button className="retake-btn" onClick={retake}>
              🔄 Retake
            </button>
            <button 
              className="submit-btn" 
              onClick={submitPhoto}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "✓ Submit Photo"}
            </button>
          </div>
        </div>
      )}

      {mode === "submitted" && (
        <div className="submitted-mode">
          <div className="success-icon">✓</div>
          <h4>Photo Submitted!</h4>
          <p>Your proof has been recorded</p>
          {photo && <img src={photo} alt="Submitted" className="submitted-photo" />}
        </div>
      )}
    </div>
  );
}