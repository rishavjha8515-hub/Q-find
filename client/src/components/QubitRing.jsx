import "./QubitRing.css";

export function QubitRing({ stability, size=180, teamName = ""}) {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (stability / 100) * circumference;

    const getColor = (s) => {
        if (s > 60 ) return "#00f5d4";
        if (s > 30 ) return "#fee440";
        return "#ff4d6d";
    };

    const color = getColor(stability);

    return (
        <div className="qubit-ring" style={{ width: size, height: size }}>
            <svg className="qubit-svg" viewBox={`0  0 ${size} ${size} `}>
              {/* Background track */}
              <circle
              className="qubit-track"
               cx={size/2}
               cy={size/2}
               r={radius}
               fill="none"
               stroke={color}
               strokeWidth="10"
               strokeLinecap="round"
               strokeDasharray={circumference}
               strokeDashoffset={offset}
               transform={`rotate(-90 ${size / 2} ${size / 2})`}
               style={{
                transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease"
               }}
               />
            </svg>

            <div className="qubit-center">
                <div className="qubit-value" style={{ color}}>
                    {Math.round(stability)}%
                    </div>
                <div className="qubit-label">STABILITY</div>
                {teamNAME && <div classNAME="qubit-team">{teamName}</div>}
                </div>
            </div>
    );
}