// client/src/components/GPSTracker.jsx
// Real-time GPS tracking and proximity display

import { useState, useEffect } from "react";
import "./GPSTracker.css";

export function GPSTracker({ onLocationUpdate }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    if (!tracking) return;

    if (!navigator.geolocation) {
      setError("Geolocation not supported by browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        
        setLocation(loc);
        setAccuracy(position.coords.accuracy);
        setError(null);
        
        if (onLocationUpdate) {
          onLocationUpdate(loc);
        }
      },
      (err) => {
        setError(err.message);
        console.error("GPS error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking, onLocationUpdate]);

  const startTracking = () => {
    setTracking(true);
    setError(null);
  };

  const stopTracking = () => {
    setTracking(false);
  };

  return (
    <div className="gps-tracker">
      <div className="gps-header">
        <div className="gps-icon">📍</div>
        <div>
          <div className="gps-title">GPS TRACKING</div>
          <div className="gps-subtitle">
            {tracking ? "Active" : "Inactive"}
          </div>
        </div>
        <button
          className={`gps-toggle ${tracking ? "active" : ""}`}
          onClick={tracking ? stopTracking : startTracking}
        >
          {tracking ? "Stop" : "Start"}
        </button>
      </div>

      {error && (
        <div className="gps-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {location && (
        <div className="gps-info">
          <div className="gps-row">
            <span className="gps-label">Latitude:</span>
            <span className="gps-value">{location.lat.toFixed(6)}°</span>
          </div>
          <div className="gps-row">
            <span className="gps-label">Longitude:</span>
            <span className="gps-value">{location.lng.toFixed(6)}°</span>
          </div>
          {accuracy && (
            <div className="gps-row">
              <span className="gps-label">Accuracy:</span>
              <span className={`gps-value ${accuracy < 50 ? "good" : "poor"}`}>
                ±{Math.round(accuracy)}m
              </span>
            </div>
          )}
        </div>
      )}

      {tracking && !location && !error && (
        <div className="gps-loading">
          <div className="pulse-circle"></div>
          Acquiring GPS signal...
        </div>
      )}
    </div>
  );
}