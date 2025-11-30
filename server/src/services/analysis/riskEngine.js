// server/services/analysis/riskEngine.js
function scoreClause(label, text, prob) {
  let score = 10;

  if (/liabilit|indemn/i.test(text)) score += 40;
  if (/penalt|fine|damages/i.test(text)) score += 25;
  if (/breach/i.test(text)) score += 20;
  if (prob !== null && prob !== undefined && prob < 0.6) score += 10;

  return Math.min(score, 100);
}

function toRiskLevel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

module.exports = { scoreClause, toRiskLevel };
