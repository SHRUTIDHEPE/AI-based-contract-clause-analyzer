// server/services/analysis/mlClient.js
const axios = require("axios");

const ML_BATCH_URL = process.env.ML_BATCH_URL || "http://127.0.0.1:8000/predict-batch";
const BATCH_SIZE = parseInt(process.env.ML_BATCH_SIZE || "16");
const TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || "8000");

async function postBatch(texts) {
  try {
    const res = await axios.post(ML_BATCH_URL, { texts }, { timeout: TIMEOUT });
    return res.data.predictions;
  } catch (err) {
    // one retry
    try {
      await new Promise(r => setTimeout(r, 300));
      const res = await axios.post(ML_BATCH_URL, { texts }, { timeout: TIMEOUT });
      return res.data.predictions;
    } catch (e) {
      console.error("ML batch call failed:", e.message);
      return null;
    }
  }
}

async function predictBatched(clauses) {
  const results = [];
  for (let i = 0; i < clauses.length; i += BATCH_SIZE) {
    const batch = clauses.slice(i, i + BATCH_SIZE);
    const preds = await postBatch(batch);
    if (!preds) {
      for (let j = 0; j < batch.length; j++) results.push(null);
    } else {
      results.push(...preds);
    }
  }
  return results;
}

module.exports = { predictBatched };
