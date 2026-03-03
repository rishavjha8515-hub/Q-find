// Suggests optimal path through NYC landmarks

import { useState, useEffect } from "react";
import "./RouteOptimizer.css";

const API = "https://q-find-backend.onrender.com"; // UPDATE

// Haversine distance function (copied from backend)
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Greedy nearest neighbor TSP approximation
function optimizeRoute(landmarks, startLocation) {
  if (!landmarks || landmarks.length === 0) return [];
  
  const unvisited = [...landmarks];
  const route = [];
  let current = startLocation || { lat: 40.7484, lng: -73.9857 }; // Default: Empire State

  while (unvisited.length > 0) {
    // Find nearest unvisited landmark
    let nearestIndex = 0;
    let nearestDist = distance(
      current.lat,
      current.lng,
      unvisited[0].lat,
      unvisited[0].lng
    );

    for (let i = 1; i < unvisited.length; i++) {
      const dist = distance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push({
      ...nearest,
      distanceFromPrev: nearestDist,
    });
    current = nearest;
  }

  return route;
}

export function RouteOptimizer({ currentPosition }) {
  const [landmarks, setLandmarks] = useState([]);
  const [route, setRoute] = useState([]);
  const [selectedZones, setSelectedZones] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    // Load landmarks
    fetch(`${API}/api/qr/landmarks`)
      .then((r) => r.json())
      .then((d) => setLandmarks(d.landmarks || []))
      .catch((e) => console.error("Failed to load landmarks:", e));
  }, []);

  const toggleZone = (zone) => {
    const newZones = new Set(selectedZones);
    if (newZones.has(zone)) {
      newZones.delete(zone);
    } else {
      newZones.add(zone);
    }
    setSelectedZones(newZones);
  };

  const calculateRoute = () => {
    setLoading(true);

    // Filter landmarks by selected zones
    let filtered = landmarks;
    if (selectedZones.size > 0) {
      filtered = landmarks.filter((lm) => selectedZones.has(lm.zone));
    }

    // Optimize
    const optimized = optimizeRoute(filtered, currentPosition);
    setRoute(optimized);

    // Calculate total distance
    const total = optimized.reduce((sum, lm) => sum + (lm.distanceFromPrev || 0), 0);
    setTotalDistance(total);

    // Estimate time (assume 5 km/h walking + 2 min per landmark)
    const walkTime = (total / 5) * 60; // minutes
    const landmarkTime = optimized.length * 2; // minutes
    setEstimatedTime(Math.round(walkTime + landmarkTime));

    setLoading(false);
  };

  const zones = [...new Set(landmarks.map((lm) => lm.zone))];

  return (
    <div className="route-optimizer">
      <div className="optimizer-header">
        <h2>🗺️ ROUTE OPTIMIZER</h2>
        <p>Find the fastest path through landmarks</p>
      </div>

      {/* Zone Filter */}
      <div className="zone-filter">
        <h3>Select Zones</h3>
        <div className="zone-buttons">
          {zones.map((zone) => (
            <button
              key={zone}
              className={`zone-btn ${selectedZones.has(zone) ? "selected" : ""}`}
              onClick={() => toggleZone(zone)}
            >
              {zone}
            </button>
          ))}
        </div>
        <button className="clear-zones" onClick={() => setSelectedZones(new Set())}>
          Clear All
        </button>
      </div>

      {/* Calculate Button */}
      <button className="calculate-btn" onClick={calculateRoute} disabled={loading}>
        {loading ? "Calculating..." : "🧭 Calculate Optimal Route"}
      </button>

      {/* Route Display */}
      {route.length > 0 && (
        <div className="route-results">
          <div className="route-stats">
            <div className="stat">
              <div className="stat-value">{route.length}</div>
              <div className="stat-label">Landmarks</div>
            </div>
            <div className="stat">
              <div className="stat-value">{totalDistance.toFixed(1)} km</div>
              <div className="stat-label">Total Distance</div>
            </div>
            <div className="stat">
              <div className="stat-value">{estimatedTime} min</div>
              <div className="stat-label">Estimated Time</div>
            </div>
          </div>

          <div className="route-list">
            {route.map((lm, index) => (
              <div key={lm.id} className="route-item">
                <div className="route-number">{index + 1}</div>
                <div className="route-info">
                  <div className="route-name">{lm.name}</div>
                  <div className="route-zone">{lm.zone}</div>
                  {index > 0 && (
                    <div className="route-distance">
                      {lm.distanceFromPrev.toFixed(2)} km from previous
                    </div>
                  )}
                </div>
                <div className="route-arrow">→</div>
              </div>
            ))}
          </div>

          <div className="route-actions">
            <button className="share-route">
              📤 Share Route
            </button>
            <button className="export-route">
              📥 Export to Maps
            </button>
          </div>
        </div>
      )}

      {/* Algorithm Info */}
      <div className="algorithm-info">
        <h4>🧠 How It Works</h4>
        <p>
          Uses a greedy nearest-neighbor approximation of the Traveling Salesman Problem.
          Starts from your current location and always moves to the nearest unvisited landmark.
        </p>
        <p>
          <strong>Note:</strong> This is an approximation, not guaranteed optimal,
          but usually within 25% of the true shortest path.
        </p>
      </div>
    </div>
  );
}