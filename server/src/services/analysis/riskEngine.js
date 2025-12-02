// server/src/services/analysis/riskEngine.js

// TODO: fill real label names from your training config
const LABELS = [
  // index -> label name mapping, e.g.:
  // "Other_0", "Termination", "Payment", ...
];

const HIGH_RISK_LABELS = new Set([
  "Termination",
  "Liability",
  "Indemnity",
  "IP Ownership",
  "Limitation of Liability",
]);

const MEDIUM_RISK_LABELS = new Set([
  "Payment Terms",
  "Confidentiality",
  "Governing Law",
]);

function mapIndexToLabel(idx) {
  return LABELS[idx] || `LABEL_${idx}`;
}

function computeClauseRisk(label, maxProb) {
  let base = 0.3;

  if (HIGH_RISK_LABELS.has(label)) base = 0.75;
  else if (MEDIUM_RISK_LABELS.has(label)) base = 0.5;

  const confidenceBoost = (maxProb - 0.5) * 0.5; // from -0.25 to +0.25
  let score = base + confidenceBoost;
  score = Math.min(Math.max(score, 0), 1);

  const riskScore = Math.round(score * 100);

  let riskLevel = "Low";
  if (riskScore >= 70) riskLevel = "High";
  else if (riskScore >= 40) riskLevel = "Medium";

  return { riskScore, riskLevel };
}

function aggregateContractRisk(results) {
  if (!results || results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + (r.riskScore || 0), 0);
  return Math.round(sum / results.length);
}

module.exports = {
  mapIndexToLabel,
  computeClauseRisk,
  aggregateContractRisk,
};
