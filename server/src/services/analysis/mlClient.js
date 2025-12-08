import { apiError } from "../../utils/apiError.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/predict-batch";

const predict = async (clauses) => {
    console.log("🤖 [predict] Sending batch to ML server, count:", clauses.length);
    try {
        const response = await fetch(ML_SERVICE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ texts: clauses }),
        });

        console.log("🤖 [predict] ML server response status:", response.status);
        if (!response.ok) {
            throw new apiError(500, "ML service request failed");
        }

        const data = await response.json();
        console.log("🤖 [predict] Predictions received, count:", data.results.length);

        // Transform new format to old format for compatibility
        const transformed = data.results.map(result => ({
            label: result.clause_type, // Use clause_type as label
            probabilities: [result.confidence], // Single probability for now
            clause_type: result.clause_type,
            confidence: result.confidence,
            risk_score: result.risk_score
        }));

        return transformed;
    } catch (error) {
        console.error("Error calling ML service:", error);
        throw new apiError(500, "Failed to get predictions from ML service");
    }
};

export const predictBatch = async (clauses, batchSize = 16) => {
    const predictions = [];
    for (let i = 0; i < clauses.length; i += batchSize) {
        const batch = clauses.slice(i, i + batchSize);
        let retries = 1;
        while (retries >= 0) {
            try {
                const batchPredictions = await predict(batch);
                predictions.push(...batchPredictions);
                break;
            } catch (error) {
                console.error(`Error processing batch, retries left: ${retries}`, error);
                retries--;
                if (retries < 0) {
                    throw error;
                }
            }
        }
    }
    return predictions;
};

export const predictClauses = predictBatch;
