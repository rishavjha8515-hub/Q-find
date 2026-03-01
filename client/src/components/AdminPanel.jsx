// client/src/components/AdminPanel.jsx
// Admin control panel for game moderation and management

import { useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import "./AdminPanel.css";

const API = "http://192.168.216.148:3000"; // UPDATE WITH YOUR IP
const ADMIN_PASSWORD = "quantum2026"; // Change this!

export function AdminPanel() {
  const { allTeams, connected } = useWebSocket();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [message, setMessage] = useState(null);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setMessage({ type: "success", text: "Admin access granted" });
    } else {
      setMessage({ type: "error", text: "Invalid password" });
    }
  };

  const resetTeam = async (teamId) => {
    if (!confirm(`Reset team ${teamId}? This will clear all progress.`)) return;

    try {
      const res = await fetch(`${API}/api/admin/reset-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, adminPassword: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      setMessage({ type: "success", text: `Team ${teamId} reset successfully` });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to reset team" });
    }
  };

  const unlockTeam = async (teamId) => {
    try {
      const res = await fetch(`${API}/api/admin/unlock-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, adminPassword: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      setMessage({ type: "success", text: `Team ${teamId} unlocked` });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to unlock team" });
    }
  };

  const setStability = async (teamId, stability) => {
    try {
      const res = await fetch(`${API}/api/admin/set-stability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, stability, adminPassword: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      setMessage({ type: "success", text: `Stability set to ${stability}%` });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to set stability" });
    }
  };

  const deleteTeam = async (teamId) => {
    if (!confirm(`DELETE team ${teamId}? This cannot be undone!`)) return;

    try {
      const res = await fetch(`${API}/api/admin/delete-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, adminPassword: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      setMessage({ type: "success", text: `Team ${teamId} deleted` });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete team" });
    }
  };

  const resetAllTeams = async () => {
    if (!confirm("RESET ALL TEAMS? This will clear all progress!")) return;

    try {
      const res = await fetch(`${API}/api/admin/reset-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      setMessage({ type: "success", text: "All teams reset" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to reset all teams" });
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h2>ADMIN ACCESS</h2>
          <p>Enter admin password to continue</p>
          <input
            type="password"
            className="password-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && login()}
          />
          <button className="login-btn" onClick={login}>
            Unlock
          </button>
          {message && (
            <div className={`login-message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🔧 ADMIN PANEL</h2>
        <div className="admin-status">
          <span className={`ws-status ${connected ? "connected" : "disconnected"}`}>
            {connected ? "● Live" : "○ Offline"}
          </span>
          <button
            className="logout-btn"
            onClick={() => {
              setAuthenticated(false);
              setPassword("");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
          <button className="close-message" onClick={() => setMessage(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Global Actions */}
      <div className="admin-section">
        <h3>⚙️ Global Actions</h3>
        <div className="action-buttons">
          <button className="action-btn danger" onClick={resetAllTeams}>
            🗑️ Reset All Teams
          </button>
          <button
            className="action-btn"
            onClick={() =>
              setMessage({ type: "info", text: `${allTeams.length} teams active` })
            }
          >
            📊 Refresh Stats
          </button>
        </div>
      </div>

      {/* Team Management */}
      <div className="admin-section">
        <h3>👥 Team Management</h3>
        {allTeams.length === 0 ? (
          <div className="no-teams-admin">No active teams</div>
        ) : (
          <div className="teams-list">
            {allTeams.map((team) => (
              <div
                key={team.teamId}
                className={`team-admin-card ${
                  selectedTeam === team.teamId ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedTeam(selectedTeam === team.teamId ? null : team.teamId)
                }
              >
                <div className="team-admin-header">
                  <div className="team-admin-id">{team.teamId}</div>
                  <div
                    className="team-admin-stability"
                    style={{
                      color:
                        team.stability > 60
                          ? "#00f5d4"
                          : team.stability > 30
                          ? "#fee440"
                          : "#ff4d6d",
                    }}
                  >
                    {Math.round(team.stability)}%
                  </div>
                </div>

                <div className="team-admin-stats">
                  <span>Checkpoints: {team.checkpoints || 0}</span>
                  <span>Idle: {team.idleTime}s</span>
                  <span>{team.locked ? "🔒 Locked" : "✓ Active"}</span>
                </div>

                {selectedTeam === team.teamId && (
                  <div className="team-admin-actions">
                    <button
                      className="admin-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        unlockTeam(team.teamId);
                      }}
                      disabled={!team.locked}
                    >
                      🔓 Unlock
                    </button>
                    <button
                      className="admin-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStability(team.teamId, 100);
                      }}
                    >
                      ⚡ Full Restore
                    </button>
                    <button
                      className="admin-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetTeam(team.teamId);
                      }}
                    >
                      🔄 Reset
                    </button>
                    <button
                      className="admin-action-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTeam(team.teamId);
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="admin-section">
        <h3>ℹ️ System Info</h3>
        <div className="system-info">
          <div className="info-row">
            <span>Total Teams:</span>
            <span>{allTeams.length}</span>
          </div>
          <div className="info-row">
            <span>Active Teams:</span>
            <span>{allTeams.filter((t) => !t.locked).length}</span>
          </div>
          <div className="info-row">
            <span>Locked Teams:</span>
            <span>{allTeams.filter((t) => t.locked).length}</span>
          </div>
          <div className="info-row">
            <span>Total Check-ins:</span>
            <span>
              {allTeams.reduce((sum, t) => sum + (t.checkpoints || 0), 0)}
            </span>
          </div>
          <div className="info-row">
            <span>WebSocket Status:</span>
            <span>{connected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}