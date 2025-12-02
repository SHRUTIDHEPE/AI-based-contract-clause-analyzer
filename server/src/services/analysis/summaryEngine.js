// server/src/services/analysis/summaryEngine.js

function buildContractSummary(results, contractRiskScore, contractDriftType) {
  const total = results.length;
  const highRiskCount = results.filter((r) => r.riskLevel === "High").length;
  const mediumRiskCount = results.filter((r) => r.riskLevel === "Medium").length;

  const overallRiskLevel =
    contractRiskScore >= 70
      ? "High"
      : contractRiskScore >= 40
      ? "Medium"
      : "Low";

  return {
    totalClauses: total,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount: total - highRiskCount - mediumRiskCount,
    overallRiskScore: contractRiskScore,
    overallRiskLevel,
    driftType: contractDriftType,
  };
}

module.exports = { buildContractSummary };
