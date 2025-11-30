// server/models/Analysis.js
const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  clauseIndex: Number,
  clauseText: String,

  label: String,
  probabilities: Array,
  riskScore: Number,
  riskLevel: { type: String, enum: ["Low", "Medium", "High"] },

  driftType: { type: String, enum: ["none", "minor", "major"], default: "none" },
  driftDetails: String,

  explanation: String,
  recommendedAction: String
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
  clauses: [String],
  results: { type: [ResultSchema], default: [] },
  riskScore: Number,
  driftType: { type: String, enum: ["none", "minor", "major"], default: "none" },
  analysedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Analysis", AnalysisSchema);
