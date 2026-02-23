// client/src/components/QubitStatus.jsx
// Live qubit status dashboard with team monitoring

import { useState, useEffect } from "react";
import { QubitRing } from "./QubitRing";
import { PuzzleModal } from "./PuzzleModal";
import "./QubitStatus.css";

const API = "http://192.168.216.148:3000"; // UPDATE WITH YOUR IP

export function QubitStatus() {
  const [myTeamId, setMyTeamId] = useState("TEAM_TEST");
  const [myQubit, setMyQubit] = useState(null);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [allTeams, setAllTeams] = useState([]);

  // Fetch my team's qubit state
  useEffect(() => {
    const fetchMyQubit = async () => {
      try {
        const res = await fetch(`${API}/api/qubit/${myTeamId}`);
        const data = await res.json();
        setMyQubit(data);
        
        // Auto-show puzzle if locked
        if (data.locked && !showPuzzle) {
          setShowPuzzle(true);
        }
      } catch (err) {
        console.error("Failed to fetch qubit:", err);
      }
    };

    fetchMyQubit();
    const interval = setInterval(fetchMyQubit, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, [myTeamId, showPuzzle]);

  // Fetch all teams
  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        const res = await fetch(`${API}/api/qubit/all/teams`);
        const data = await res.json();
        setAllTeams(data.teams || []);
      } catch (err) {
        console.error("Failed to fetch all teams:", err);
      }
    };

    fetchAllTeams();
    const interval = setInterval(fetchAllTeams, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePuzzleSuccess = () => {
    setShowPuzzle(false);
    // Force refresh
    setTimeout(() => {
      fetch(`${API}/api/qubit/${myTeamId}`)
        .then(r => r.json())
        .then(setMyQubit);
    }, 500);
  };

  return (
    <div className="qubit-status">
      {/* My Team Section */}
      <div className="my-team-section">
        <div className="section-header">
          <h2>MY QUBIT STATUS</h2>
          <input
            type="text"
            className="team-id-input"
            placeholder="Team ID"
            value={myTeamId}
            onChange={(e) => setMyTeamId(e.target.value)}
          />
        </div>

        {myQubit ? (
          <div className="my-qubit-card">
            <div className="qubit-display">
              <QubitRing
                stability={myQubit.stability}
                size={220}
                teamName={myTeamId}
              />
            </div>

            <div className="qubit-stats">
              <div className="stat-row">
                <span className="stat-label">Status:</span>
                <span className={`stat-value ${myQubit.locked ? "locked" : "active"}`}>
                  {myQubit.locked ? "🔒 LOCKED" : "✓ ACTIVE"}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Idle Time:</span>
                <span className="stat-value">{myQubit.idleTime}s</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Gamma (γ):</span>
                <span className="stat-value">{myQubit.gamma} s⁻¹</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Checkpoints:</span>
                <span className="stat-value">{myQubit.checkpoints || 0}</span>
              </div>
            </div>

            <div className="decay-formula">
              P(t) = e<sup>−γt</sup> = e<sup>−{myQubit.gamma}×{myQubit.idleTime}</sup>
            </div>

            {myQubit.locked && (
              <button
                className="unlock-btn"
                onClick={() => setShowPuzzle(true)}
              >
                🔓 SOLVE ERROR CORRECTION PUZZLE
              </button>
            )}
          </div>
        ) : (
          <div className="loading-qubit">Initializing qubit...</div>
        )}
      </div>

      {/* All Teams Section */}
      <div className="all-teams-section">
        <h2>ALL TEAMS</h2>
        
        {allTeams.length === 0 ? (
          <div className="no-teams">No active teams yet</div>
        ) : (
          <div className="teams-grid">
            {allTeams.map((team) => (
              <div key={team.teamId} className="team-card">
                <div className="team-header">
                  <span className="team-name">{team.teamId}</span>
                  {team.locked && <span className="lock-icon">🔒</span>}
                </div>
                
                <QubitRing
                  stability={team.stability}
                  size={120}
                />
                
                <div className="team-stats">
                  <div className="mini-stat">
                    <span>{team.checkpoints}</span>
                    <span>checks</span>
                  </div>
                  <div className="mini-stat">
                    <span>{team.idleTime}s</span>
                    <span>idle</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Puzzle Modal */}
      {showPuzzle && (
        <PuzzleModal
          teamId={myTeamId}
          onClose={() => setShowPuzzle(false)}
          onSuccess={handlePuzzleSuccess}
        />
      )}
    </div>
  );
}