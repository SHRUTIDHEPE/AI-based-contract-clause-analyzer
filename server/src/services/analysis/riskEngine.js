import { HIGH_RISK_TYPES, MEDIUM_RISK_TYPES, LOW_RISK_TYPES, RISKY_KEYWORDS } from "./riskRules.js";

function baseRisk(clauseType) {
  if (HIGH_RISK_TYPES.has(clauseType)) return 0.8;
  if (MEDIUM_RISK_TYPES.has(clauseType)) return 0.55;
  if (LOW_RISK_TYPES.has(clauseType)) return 0.25;
  return 0.4; // default if unknown
}

function keywordRisk(text) {
  const lower = text.toLowerCase();
  let hits = 0;

  for (const word of RISKY_KEYWORDS) {
    if (lower.includes(word)) hits++;
  }

  return Math.min(0.6, hits * 0.15);
}

export function computeClauseRisk(clauseType, confidence, text = "", riskScoreFromML = null) {
  // If risk score is provided by ML service, use it directly (convert to percentage)
  if (riskScoreFromML !== null && riskScoreFromML !== undefined) {
    return {
      riskScore: Number((Math.max(0, Math.min(1, riskScoreFromML)) * 100).toFixed(2))
    };
  }

  // Otherwise, compute as before
  const risk =
    0.6 * baseRisk(clauseType) +
    0.25 * keywordRisk(text) +
    0.15 * (1 - confidence);

  return {
    riskScore: Number((Math.max(0, Math.min(1, risk)) * 100).toFixed(2))
  };
}
