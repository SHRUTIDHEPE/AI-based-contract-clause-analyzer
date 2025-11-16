export default function AnalysisReport({ report }) {
  return (
    <div>
      <h3>Analysis Summary</h3>
      <p>Risk Score: {report.riskScore}</p>
      <p>Drift Type: {report.driftType}</p>
      <h4>Clauses:</h4>
      <ul>
        {report.clauses?.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
