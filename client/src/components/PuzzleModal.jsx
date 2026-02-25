import { useState } from "react";
import "./PuzzleModal.css";

const API = "http://192.168.34.148:3000";

export function PuzzleModal({ teamId, onClose, onSuccess }) {
    const [puzzle, setPuzzle] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setloading] = useState(false);

    useState(() => {
         fetch(`${API}/api/qubit/puzzle/random`)
      .then(r => r.json())
      .then(setPuzzle)
      .catch(console.error);
  }, []);

 const submitAnswer = async () => {
  if (selectedAnswer === null) return;
  
  setloading(true);
  try {
    const res = await fetch(`${API}/api/qubit/puzzle/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: teamId,
        puzzleId: puzzle.id,
        answerIndex: selectedAnswer
      })
    });
    
    const data = await res.json();
    setResult(data);
    
    if (data.valid) {
      setTimeout(() => {
        onSuccess && onSuccess(data);
        onClose && onClose();
      }, 2000);
    }
  } catch (err) {
    console.error("Puzzle validation error:", err);
    setResult({
      valid: false,
      message: "Network error. Try again."
    });
  }
  setloading(false);
};

  if (!puzzle) {
    return ( 
        <div className="puzzle-modal-overlay">
          <div className="puzzle-modal">
            <div className="puzzle-loading">Loading error correction gate... </div>
            </div>  
        </div>
    );
  }

  return (
    <div className="puzzle-modal-overlay">
        <div className="puzzle-modal">
            <div className="puzzle-header">
                <div className="puzzle-icon">⚠️</div>
                <h2>QUBIT DECOHERENCE</h2>
          <p>Error correction required to restore stability</p>
            </div>

            <div className="puzzle-body">
          <div className="puzzle-question">{puzzle.question}</div>
          
          <div className="puzzle-options">
            {puzzle.options.map((option, idx) => (
              <button
                key={idx}
                className={`puzzle-option ${
                  selectedAnswer === idx ? "selected" : ""
                } ${
                  result
                    ? idx === result.correctIndex
                      ? "correct"
                      : selectedAnswer === idx
                      ? "wrong"
                      : ""
                    : ""
                }`}
                onClick={() => !result && setSelectedAnswer(idx)}
                disabled={result !== null}
              >

                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
            </div>

            {result && (
              <div className={`puzzle-result ${result.valid ? "valid" : "invalid"}`}>
                <div className="result-icon">
                  {result.valid ? "✅" : "❌"}
              </div>
              <div className="result-message">{result.message}</div>
              {result.explanation && (
                <div className="result-explanation">{result.explanation}</div>
              )}
              </div>
            )}
        </div>

        <div className="puzzle-footer">
          <button
          className="puzzle-btn submit"
          onClick={submitAnswer}
          disabled={selectedAnswer === null || loading || result !== null}
          >
            {loading ? "VALIDATING..." : "SUBMIT ANSWER"}
          </button>
          {result && !result.valid&& (
            <button className="puzzle-btn-retry" onClick={() => {
              setResult(null);
              setSelectedAnswer(null);
            }}>
              TRY AGAIN
            </button>
            )}
        </div>

        <div className="puzzle-info">
          <span className="info-label">PUZZLE ID: {puzzle.id}</span>
          <span className="info-value">{puzzle.id}</span>
        </div>
    </div>
  </div>
  );
}
