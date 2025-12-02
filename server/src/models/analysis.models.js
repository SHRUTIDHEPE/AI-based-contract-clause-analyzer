// server/src/models/Analysis.js
const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    clauseIndex: Number,
    clauseText: String,

    label: String,          // human-readable label
    labelIndex: Number,     // raw index from model
    probabilities: [Number],

    riskScore: Number,      // 0–100
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },

    driftType: {
      type: String,
      enum: ["none", "minor", "major"],
      default: "none",
    },
    driftDetails: String,

    explanation: String,
    recommendedAction: String,
  },
  { _id: false }
);

const AnalysisSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
    required: true,
    index: true,
  },

  clauses: [String], // raw extracted clauses

  results: {
    type: [ResultSchema],
    default: [],
  },

  riskScore: Number, // contract-level
  driftType: {
    type: String,
    enum: ["none", "minor", "major"],
    default: "none",
  },

  analysedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Analysis", AnalysisSchema);
