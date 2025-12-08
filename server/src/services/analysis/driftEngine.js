export const detectDrift = (clauseText, baselineText, riskScore = 0) => {
    if (!baselineText) {
        return {
            drift: false,
            driftScore: 0,
            driftType: "none",
            driftDetails: "No baseline available for comparison."
        };
    }

    // Calculate text similarity using word overlap
    const clauseWords = new Set(clauseText.toLowerCase().split(/\s+/).filter(word => word.length > 2));
    const baselineWords = new Set(baselineText.toLowerCase().split(/\s+/).filter(word => word.length > 2));

    const intersection = new Set([...clauseWords].filter(x => baselineWords.has(x)));
    const union = new Set([...clauseWords, ...baselineWords]);

    const similarity = intersection.size / union.size;
    const textDrift = 1 - similarity; // Higher means more different

    // Factor in risk score - high risk clauses are more sensitive to drift
    const riskMultiplier = riskScore > 0.7 ? 1.5 : riskScore > 0.4 ? 1.2 : 1.0;
    const driftScore = Math.min(1.0, textDrift * riskMultiplier);

    const drift = driftScore > 0.2; // Lower threshold for drift detection

    let driftType = "none";
    let driftDetails = "No significant drift detected.";

    if (driftScore > 0.7) {
        driftType = "major";
        driftDetails = "Major drift detected. High-risk clause has significant deviations from standard - review clause immediately.";
    } else if (driftScore > 0.5) {
        driftType = "medium";
        driftDetails = "Medium drift detected. Moderate deviations from standard clause - consider review based on context.";
    } else if (driftScore > 0.2) {
        driftType = "minor";
        driftDetails = "Minor drift detected. Small deviations from standard clause - can be ignored unless in critical context.";
    }

    return {
        drift,
        driftScore: Math.round(driftScore * 100) / 100,
        driftType,
        driftDetails,
        similarity: Math.round(similarity * 100) / 100
    };
};
