// server/services/analysis/driftEngine.js
function detectDrift(label, text) {
  let drift = "none";
  let details = "";

  if (label && label.toLowerCase().includes("confidential") && !/delete|destroy|return/i.test(text)) {
    drift = "minor";
    details = "Missing data deletion/return clause";
  }

  // heuristics for major drift:
  if (/unlimited liability|perpetual|no limitation of liability/i.test(text)) {
    drift = "major";
    details = "Contains unlimited/perpetual obligation";
  }

  return { drift, details };
}

module.exports = { detectDrift };
