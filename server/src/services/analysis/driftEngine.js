// server/src/services/analysis/driftEngine.js

function jaccardSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (!setA.size || !setB.size) return 0;

  let intersect = 0;
  for (const token of setA) {
    if (setB.has(token)) intersect++;
  }
  const union = setA.size + setB.size - intersect;
  return intersect / union;
}

/**
 * detectDrift
 * @param {string} clauseText
 * @param {string|null} baselineText
 */
function detectDrift(clauseText, baselineText) {
  if (!baselineText) {
    return { driftType: "none", driftDetails: "" };
  }

  const similarity = jaccardSimilarity(clauseText, baselineText);

  if (similarity >= 0.8) {
    return {
      driftType: "none",
      driftDetails: `Similarity ${similarity.toFixed(2)}`,
    };
  }
  if (similarity >= 0.6) {
    return {
      driftType: "minor",
      driftDetails: `Minor deviation (similarity ${similarity.toFixed(2)})`,
    };
  }
  return {
    driftType: "major",
    driftDetails: `Major deviation (similarity ${similarity.toFixed(2)})`,
  };
}

module.exports = { detectDrift };
