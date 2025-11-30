// server/services/analysis/clauseAnalysis.js
const { scoreClause, toRiskLevel } = require("./riskEngine");
const { detectDrift } = require("./driftEngine");

function buildClauseResult(i, clauseText, mlRes) {
  let label = mlRes?.label ?? null;
  let probabilities = mlRes?.probabilities ?? null;
  const highestProb = Array.isArray(probabilities) ? Math.max(...probabilities) : null;

  if (!label) {
    if (/confidential/i.test(clauseText)) label = "Confidentiality";
    else if (/liabilit/i.test(clauseText)) label = "Liability";
    else if (/termination/i.test(clauseText)) label = "Termination";
    else label = "Other";
  }

  const riskScore = scoreClause(label, clauseText, highestProb);
  const riskLevel = toRiskLevel(riskScore);
  const { drift, details } = detectDrift(label, clauseText);

  const explanation = `Clause categorized as ${label}. Risk: ${riskLevel}.`;
  const recommendedAction = riskLevel === "High" ? "Escalate to legal team" : "Review";

  return {
    clauseIndex: i,
    clauseText,
    label,
    probabilities,
    riskScore,
    riskLevel,
    driftType: drift,
    driftDetails: details,
    explanation,
    recommendedAction
  };
}

module.exports = { buildClauseResult };
