// server/src/services/analysis/mlClient.js
const axios = require("axios");

const ML_BASE_URL = process.env.ML_SERVER_URL || "http://127.0.0.1:8000";
const TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || "10000", 10);

async function predict(text) {
  try {
    const res = await axios.post(
      `${ML_BASE_URL}/predict`,
      { text },
      { timeout: TIMEOUT }
    );
    return res.data; // { label, probabilities }
  } catch (err) {
    console.error("❌ ML predict() error:", err.message);
    return null;
  }
}

async function predictBatch(texts) {
  try {
    const res = await axios.post(
      `${ML_BASE_URL}/predict-batch`,
      { texts },
      { timeout: TIMEOUT }
    );
    return res.data.results; // [ { label, probabilities }, ... ]
  } catch (err) {
    console.error(" ML predictBatch() error:", err.message);
    return null;
  }
}

module.exports = { predict, predictBatch };
