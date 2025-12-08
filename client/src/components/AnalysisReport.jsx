export default function AnalysisReport({ analysis }) {
  return (
    <div className="text-gray-500">
      <h3>Analysis Summary</h3>
      <p>Overall Risk Score: {analysis.overallRiskScore}</p>
      <p>Summary: {analysis.summary}</p>

      <h4>Clauses:</h4>
      <ul>
        {analysis.clauses?.map((c, i) => {
          const risk = c.riskScore;
          const normalizedRisk = (risk / 100).toFixed(2); // display value

          // Hard-coded drift logic ONLY
          let driftType = "";
          if (normalizedRisk <= 0.40) {
            driftType = "Minor, can be ignored";
          } else if (normalizedRisk <= 0.70) {
            driftType = "Considerable";
          } else {
            driftType = "Critical⚠️ Needs Review";
          }

          return (
            <li key={i}>
              <strong>Clause:</strong> {c.clause}<br />
              <strong>Label:</strong> {c.label}<br />
              <strong>Confidence:</strong> {c.confidence}<br />
              <strong>Risk Score:</strong> {normalizedRisk}<br />

              {/* Only hard-coded drift, ignoring backend */}
              <strong>Drift:</strong> {driftType}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
