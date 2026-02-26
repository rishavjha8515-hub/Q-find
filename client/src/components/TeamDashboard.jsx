// client/src/components/TeamDashboard.jsx
// Live team leaderboard and stats

import { useState, useEffect } from "react";
import "./TeamDashboard.css";

const API = "http:// 172.24.150.148:3000"; // UPDATE WITH YOUR IP

export function TeamDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API}/api/qubit/all/teams`);
        const data = await res.json();
        const sorted = (data.teams || []).sort((a, b) => 
          (b.checkpoints || 0) - (a.checkpoints || 0)
        );
        setTeams(sorted);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
        setLoading(false);
      }
    };

    fetchTeams();
    const interval = setInterval(fetchTeams, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStabilityColor = (stability) => {
    if (stability > 60) return "#00f5d4";
    if (stability > 30) return "#fee440";
    return "#ff4d6d";
  };

  const totalCheckpoints = teams.reduce((sum, t) => sum + (t.checkpoints || 0), 0);
  const avgStability = teams.length > 0
    ? teams.reduce((sum, t) => sum + t.stability, 0) / teams.length
    : 0;
  const activeTeams = teams.filter(t => !t.locked).length;

  return (
    <div className="team-dashboard">
      <div className="dashboard-header">
        <h2>📊 LIVE LEADERBOARD</h2>
        <div className="refresh-indicator">
          <span className="pulse-dot"></span>
          Updating every 5s
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{teams.length}</div>
          <div className="stat-label">Active Teams</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalCheckpoints}</div>
          <div className="stat-label">Total Check-ins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(avgStability)}%</div>
          <div className="stat-label">Avg Stability</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeTeams}</div>
          <div className="stat-label">Unlocked</div>
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="loading-teams">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="no-teams">
          <div className="no-teams-icon">🏆</div>
          <div>No teams yet</div>
          <div className="no-teams-hint">Scan a QR code to initialize your team</div>
        </div>
      ) : (
        <div className="leaderboard">
          <div className="leaderboard-header">
            <div className="col-rank">#</div>
            <div className="col-team">Team</div>
            <div className="col-checks">Checks</div>
            <div className="col-stability">Stability</div>
            <div className="col-status">Status</div>
          </div>

          {teams.map((team, index) => (
            <div key={team.teamId} className="leaderboard-row">
              <div className="col-rank">
                <span className={`rank-badge ${index < 3 ? `top-${index + 1}` : ""}`}>
                  {index + 1}
                </span>
              </div>
              <div className="col-team">
                <span className="team-name">{team.teamId}</span>
              </div>
              <div className="col-checks">
                <span className="checks-value">{team.checkpoints || 0}</span>
              </div>
              <div className="col-stability">
                <div className="stability-mini-bar">
                  <div
                    className="stability-mini-fill"
                    style={{
                      width: `${team.stability}%`,
                      background: getStabilityColor(team.stability)
                    }}
                  />
                </div>
                <span
                  className="stability-value"
                  style={{ color: getStabilityColor(team.stability) }}
                >
                  {Math.round(team.stability)}%
                </span>
              </div>
              <div className="col-status">
                {team.locked ? (
                  <span className="status-badge locked">🔒 Locked</span>
                ) : (
                  <span className="status-badge active">✓ Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formula Display */}
      <div className="formula-display">
        <div className="formula-label">DECOHERENCE MODEL</div>
        <div className="formula-text">
          P(t) = e<sup>−γt</sup> where γ = 0.02 s<sup>−1</sup>
        </div>
        <div className="formula-explanation">
          Qubit stability decays exponentially with idle time. 
          Check-ins restore +20% stability. Lock occurs at 0%.
        </div>
      </div>
    </div>
  );
}