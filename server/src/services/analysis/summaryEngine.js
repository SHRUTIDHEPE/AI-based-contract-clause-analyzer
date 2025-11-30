// server/services/analysis/summaryEngine.js
function computeContractSummary(results) {
  if (!results || results.length === 0) {
    return { finalRiskScore: 0, finalDrift: "none" };
  }
  const scores = results.map(r => r.riskScore || 0);
  const avgRisk = scores.reduce((a,b) => a+b, 0) / scores.length;

  let finalDrift = "none";
  if (results.some(r => r.driftType === "major")) finalDrift = "major";
  else if (results.some(r => r.driftType === "minor")) finalDrift = "minor";

  return { finalRiskScore: avgRisk, finalDrift };
}

module.exports = { computeContractSummary };
