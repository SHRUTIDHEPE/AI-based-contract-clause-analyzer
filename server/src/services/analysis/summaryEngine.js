export const buildContractSummary = (results, contractRiskScore, contractDriftType) => {
    const summary = {
        overallRisk: contractRiskScore,
        drift: contractDriftType,
        highlights: [],
    };

    if (contractRiskScore > 75) {
        summary.highlights.push("The contract has a high risk score.");
    }
    if (contractDriftType === "major") {
        summary.highlights.push("There is a major drift from the standard clauses.");
    }

    if (summary.highlights.length === 0) {
        summary.highlights.push("The contract appears to be standard and low-risk.");
    }

    return summary;
};

export const generateSummary = (results) => {
    const contractRiskScore = results.reduce((acc, r) => acc + r.riskScore, 0) / results.length;
    const contractDriftType = results.reduce((acc, r) => {
        if (r.drift === "major") return "major";
        if (r.drift === "minor" && acc !== "major") return "minor";
        return acc;
    }, "none");
    const summaryObj = buildContractSummary(results, contractRiskScore, contractDriftType);
    return summaryObj.highlights.join(". ") + ".";
};
