// server/src/services/analysis/clauseAnalysis.js
const { predictBatch } = require("./mlClient");
const {
  mapIndexToLabel,
  computeClauseRisk,
  aggregateContractRisk,
} = require("./riskEngine");
const { detectDrift } = require("./driftEngine");

// Placeholder: later you can fetch a baseline clause from DB based on label
async function getBaselineClauseFor(label) {
  return null; // no clause bank yet
}

async function analyzeClauses(clauses) {
  if (!clauses || clauses.length === 0) {
    return {
      results: [],
      contractRiskScore: 0,
      contractDriftType: "none",
    };
  }

  const mlResults = await predictBatch(clauses);

  if (!mlResults) {
    const fallbackResults = clauses.map((clauseText, idx) => ({
      clauseIndex: idx,
      clauseText,
      label: "UNKNOWN",
      labelIndex: -1,
      probabilities: [],
      riskScore: 10,
      riskLevel: "Low",
      driftType: "none",
      driftDetails: "ML server unavailable",
      explanation: "ML model not reachable; default low-risk classification.",
      recommendedAction:
        "Re-run analysis when the model server is available or consult legal manually.",
    }));

    return {
      results: fallbackResults,
      contractRiskScore: 10,
      contractDriftType: "none",
    };
  }

  const results = [];
  let maxDrift = "none"; // none < minor < major

  for (let i = 0; i < clauses.length; i++) {
    const clauseText = clauses[i];
    const pred = mlResults[i];

    const labelIndex = pred?.label ?? -1;
    const probs = pred?.probabilities || [];
    const maxProb = probs.length ? Math.max(...probs) : 0;
    const label = mapIndexToLabel(labelIndex);

    const { riskScore, riskLevel } = computeClauseRisk(label, maxProb);

    const baselineText = await getBaselineClauseFor(label);
    const { driftType, driftDetails } = detectDrift(clauseText, baselineText);

    if (driftType === "major") maxDrift = "major";
    else if (driftType === "minor" && maxDrift === "none") maxDrift = "minor";

    const explanation =
      `Clause classified as "${label}" with confidence ${(maxProb * 100).toFixed(
        1
      )}%. ` +
      `Risk assessed as ${riskLevel} (score ${riskScore}).`;

    const recommendedAction =
      riskLevel === "High"
        ? "Review with legal counsel and consider renegotiation."
        : riskLevel === "Medium"
        ? "Review to ensure alignment with internal policies."
        : "No immediate action required; monitor for future changes.";

    results.push({
      clauseIndex: i,
      clauseText,
      label,
      labelIndex,
      probabilities: probs,
      riskScore,
      riskLevel,
      driftType,
      driftDetails,
      explanation,
      recommendedAction,
    });
  }

  const contractRiskScore = aggregateContractRisk(results);

  return {
    results,
    contractRiskScore,
    contractDriftType: maxDrift,
  };
}

module.exports = { analyzeClauses };
