const PUZZLES = [
    {
       id: 1,
    question: "A qubit in state |ψ⟩ = α|0⟩ + β|1⟩ undergoes decoherence. What conserved quantity determines the decay rate?",
    options: [
      "Linear momentum",
      "Off-diagonal density matrix elements (coherences)",
      "Total spin magnitude",
      "Hamiltonian eigenvalue"
    ],
    correctIndex: 1,
    explanation: "Decoherence destroys the off-diagonal elements of the density matrix, which represent quantum coherence. The decay rate γ governs how quickly these elements vanish."
  },
  {
    id: 2,
    question: "In the Lindblad master equation, which operator describes energy dissipation to the environment?",
    options: [
      "Pauli-X gate",
      "Hadamard operator",
      "Jump operator L̂",
      "Identity matrix"
    ],
    correctIndex: 2,
    explanation: "The jump operator (Lindblad operator) L̂ describes how the system couples to its environment, causing decoherence and energy dissipation."
  },
  {
    id: 3,
    question: "If γ = 0.02 s⁻¹ and t = 20s, what is the qubit stability P(t) = e^(-γt)?",
    options: [
      "≈ 0.135",
      "≈ 0.368",
      "≈ 0.670",
      "≈ 0.819"
    ],
    correctIndex: 2,
    explanation: "P(20) = e^(-0.02 × 20) = e^(-0.4) ≈ 0.670 or 67%. This represents a 33% loss of coherence over 20 seconds."
  },
  {
    id: 4,
    question: "What is the primary cause of decoherence in quantum systems at room temperature?",
    options: [
      "Vacuum fluctuations",
      "Thermal phonons and environmental noise",
      "Cosmic radiation",
      "Magnetic field gradients"
    ],
    correctIndex: 1,
    explanation: "At room temperature, thermal phonons (lattice vibrations) and environmental noise are the dominant decoherence mechanisms, coupling the qubit to a thermal bath."
  },
  {
    id: 5,
    question: "In the density matrix ρ = |ψ⟩⟨ψ|, what happens to the off-diagonal elements during decoherence?",
    options: [
      "They increase exponentially",
      "They remain constant",
      "They decay to zero",
      "They oscillate periodically"
    ],
    correctIndex: 2,
    explanation: "Decoherence causes the off-diagonal elements (coherences) to decay exponentially to zero, transforming a pure state into a mixed state."
  },
  {
    id: 6,
    question: "What does the quantum Zeno effect suggest about frequent measurements?",
    options: [
      "They accelerate decoherence",
      "They can freeze quantum evolution",
      "They have no effect on the system",
      "They increase entanglement"
    ],
    correctIndex: 1,
    explanation: "The quantum Zeno effect shows that frequent measurements can inhibit quantum evolution, effectively 'freezing' the system in its current state."
  },
  {
    id: 7,
    question: "In quantum error correction, what is the minimum number of physical qubits needed to encode one logical qubit?",
    options: [
      "2 qubits",
      "3 qubits",
      "5 qubits",
      "7 qubits"
    ],
    correctIndex: 1,
    explanation: "The 3-qubit bit-flip code is the simplest quantum error correction code, though more robust codes like the Shor code use 9 qubits."
  },
  {
    id: 8,
    question: "What quantity is preserved even as a qubit decoheres from a pure state to a mixed state?",
    options: [
      "Coherence length",
      "Phase information",
      "Trace of the density matrix",
      "Superposition amplitude"
    ],
    correctIndex: 2,
    explanation: "The trace of the density matrix (Tr(ρ) = 1) is always preserved, representing conservation of total probability during decoherence."
  }  
];

/**
 * Get a random puzzle for the team
 */
function getRandomPuzzle() {
    const index = Math.floor(Math.random() * PUZZLES.length);
    return{
        ...PUZZLES[index],
        correctIndex: undefined, // Hide correct answer from client
        explanation: undefined,
    };
}

/**
 * *Validate puzzle answer
 */
function validateAnswer(puzzleId, answerIndex) {
    const puzzle = PUZZLES.find(p => p.id === puzzleId);
    if (!puzzle) {
        return { valid: false, message: "puzzle not found"};
    }

    const correct = answerIndex === puzzle.correctIndex;

    return{
        valid: correct,
        correctIndex: puzzle.correctIndex,
        explanation: puzzle.explanation,
        message: correct
            ? "✓ Correct! Applying Hadamard correction..."
      : "✗ Incorrect. Quantum state further destabilized."
    };
}

module .exports = {
    PUZZLES,
    getRandomPuzzle,
    validateAnswer,
};