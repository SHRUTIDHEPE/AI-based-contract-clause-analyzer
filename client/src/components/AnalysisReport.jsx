export default function AnalysisReport({ analysis }) {
  return (
    <div className="text-gray-500">
      <h3>Analysis Summary</h3>
      <p>Overall Risk Score: {analysis.overallRiskScore}</p>
      <p>Summary: {analysis.summary}</p>
      <h4>Clauses:</h4>
      <ul>
        {analysis.clauses?.map((c, i) => (
          <li key={i}>
            <strong>Clause:</strong> {c.clause}<br />
            <strong>Label:</strong> {c.label}<br />
            <strong>Confidence:</strong> {c.confidence}<br />
            <strong>Risk Score:</strong> {c.riskScore}<br />
            <strong>Drift:</strong> {c.drift ? `${c.drift.driftType} (${c.drift.driftDetails})` : 'None'}
          </li>
        ))}
      </ul>
    </div>
  );
}
