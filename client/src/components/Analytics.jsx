// client/src/components/Analytics.jsx
// Analytics dashboard with team performance visualization

import { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import "./Analytics.css";

const API = "https://q-find-backend.onrender.com";

export function Analytics() {
  const { allTeams, connected } = useWebSocket();
  const [timeRange, setTimeRange] = useState("1h"); // 1h, 6h, 24h
  const [selectedMetric, setSelectedMetric] = useState("stability");

  // Calculate aggregate stats
  const stats = {
    totalTeams: allTeams.length,
    activeTeams: allTeams.filter(t => !t.locked).length,
    lockedTeams: allTeams.filter(t => t.locked).length,
    totalCheckpoints: allTeams.reduce((sum, t) => sum + (t.checkpoints || 0), 0),
    avgStability: allTeams.length > 0
      ? allTeams.reduce((sum, t) => sum + t.stability, 0) / allTeams.length
      : 0,
    maxStability: Math.max(...allTeams.map(t => t.stability), 0),
    minStability: Math.min(...allTeams.map(t => t.stability), 100),
  };

  // Group teams by stability ranges
  const stabilityDistribution = {
    high: allTeams.filter(t => t.stability > 70).length,
    medium: allTeams.filter(t => t.stability > 30 && t.stability <= 70).length,
    low: allTeams.filter(t => t.stability <= 30 && !t.locked).length,
    locked: allTeams.filter(t => t.locked).length,
  };

  // Top performers
  const topTeams = [...allTeams]
    .sort((a, b) => (b.checkpoints || 0) - (a.checkpoints || 0))
    .slice(0, 5);

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>📈 ANALYTICS DASHBOARD</h2>
        <div className="connection-status">
          <span className={`status-indicator ${connected ? "connected" : "disconnected"}`}></span>
          {connected ? "Live" : "Disconnected"}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="analytics-overview">
        <div className="stat-card-large">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTeams}</div>
            <div className="stat-label">Total Teams</div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeTeams}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <div className="stat-value">{stats.lockedTeams}</div>
            <div className="stat-label">Locked</div>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCheckpoints}</div>
            <div className="stat-label">Check-ins</div>
          </div>
        </div>
      </div>

      {/* Stability Distribution */}
      <div className="analytics-section">
        <h3>Stability Distribution</h3>
        <div className="distribution-chart">
          <div
            className="distribution-bar high"
            style={{
              width: `${(stabilityDistribution.high / stats.totalTeams) * 100}%`
            }}
          >
            <span className="bar-label">
              {stabilityDistribution.high} (&gt;70%)
            </span>
          </div>
          <div
            className="distribution-bar medium"
            style={{
              width: `${(stabilityDistribution.medium / stats.totalTeams) * 100}%`
            }}
          >
            <span className="bar-label">
              {stabilityDistribution.medium} (30-70%)
            </span>
          </div>
          <div
            className="distribution-bar low"
            style={{
              width: `${(stabilityDistribution.low / stats.totalTeams) * 100}%`
            }}
          >
            <span className="bar-label">
              {stabilityDistribution.low} ({"\u003c"}30%)
            </span>
          </div>
          <div
            className="distribution-bar locked"
            style={{
              width: `${(stabilityDistribution.locked / stats.totalTeams) * 100}%`
            }}
          >
            <span className="bar-label">
              {stabilityDistribution.locked} (Locked)
            </span>
          </div>
        </div>
      </div>

      {/* Stability Stats */}
      <div className="analytics-section">
        <h3>Stability Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-box">
            <div className="metric-label">Average</div>
            <div className="metric-value" style={{ color: getStabilityColor(stats.avgStability) }}>
              {Math.round(stats.avgStability)}%
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Maximum</div>
            <div className="metric-value" style={{ color: getStabilityColor(stats.maxStability) }}>
              {Math.round(stats.maxStability)}%
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Minimum</div>
            <div className="metric-value" style={{ color: getStabilityColor(stats.minStability) }}>
              {Math.round(stats.minStability)}%
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="analytics-section">
        <h3>🏆 Top Performers</h3>
        {topTeams.length === 0 ? (
          <div className="no-data">No teams yet</div>
        ) : (
          <div className="top-performers">
            {topTeams.map((team, index) => (
              <div key={team.teamId} className="performer-row">
                <div className={`performer-rank rank-${index + 1}`}>
                  {index + 1}
                </div>
                <div className="performer-name">{team.teamId}</div>
                <div className="performer-stats">
                  <span className="performer-checks">
                    {team.checkpoints || 0} ✓
                  </span>
                  <span
                    className="performer-stability"
                    style={{ color: getStabilityColor(team.stability) }}
                  >
                    {Math.round(team.stability)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Feed */}
      <div className="analytics-section">
        <h3>⚡ Live Activity</h3>
        <div className="activity-feed">
          {allTeams.slice(0, 10).map((team) => (
            <div key={team.teamId} className="activity-item">
              <div className="activity-team">{team.teamId}</div>
              <div className="activity-status">
                {team.locked ? (
                  <span className="activity-locked">🔒 Locked</span>
                ) : (
                  <span
                    className="activity-stability"
                    style={{ color: getStabilityColor(team.stability) }}
                  >
                    {Math.round(team.stability)}% stability
                  </span>
                )}
              </div>
              <div className="activity-time">
                {team.idleTime}s idle
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getStabilityColor(stability) {
  if (stability > 60) return "#00f5d4";
  if (stability > 30) return "#fee440";
  return "#ff4d6d";
}
