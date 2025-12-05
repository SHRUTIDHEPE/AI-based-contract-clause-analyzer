const LABEL_MAPPING = {
    0: "Default",
    5: "Governing Law",
    8: "Non-Compete",
    12: "Limitation of Liability",
    15: "Payment Terms",
    23: "Indemnification",
    33: "Confidentiality",
    48: "Termination for Cause",
    100: "Error"
};

const RISK_MAPPING = {
    "Termination for Cause": 80,
    "Limitation of Liability": 70,
    "Indemnification": 60,
    "Confidentiality": 50,
    "Governing Law": 20,
    "Payment Terms": 40,
    "Non-Compete": 90,
    "Default": 0,
    "Error": 100,
    "UNKNOWN": 10
};

export const mapIndexToLabel = (index) => {
    return LABEL_MAPPING[index] || "UNKNOWN";
};

export const computeClauseRisk = (label, confidence) => {
    const baseRisk = RISK_MAPPING[label] || 10;
    const riskScore = baseRisk + (100 - baseRisk) * (1 - confidence);
    let riskLevel;
    if (riskScore > 75) {
        riskLevel = "high";
    } else if (riskScore > 40) {
        riskLevel = "medium";
    } else {
        riskLevel = "low";
    }
    return { riskScore, riskLevel };
};

export const aggregateContractRisk = (results) => {
    if (!results || results.length === 0) {
        return 0;
    }
    const totalRisk = results.reduce((acc, result) => acc + result.riskScore, 0);
    return totalRisk / results.length;
};
