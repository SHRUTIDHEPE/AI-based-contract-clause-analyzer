import mongoose from "mongoose";

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

const DriftSchema = new mongoose.Schema(
  {
    drift: Boolean,
    driftScore: Number,
    driftType: {
      type: String,
      enum: ["none", "minor", "major"],
      default: "none",
    },
    driftDetails: String,
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

  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
  },

  summary: {
    type: String,
    default: "",
  },

  overallRiskScore: {
    type: Number,
    default: 0,
  },

  clauses: [{
    clause: String,
    label: String,
    confidence: Number,
    riskScore: Number,
    drift: DriftSchema,
  }], // analysis results for each clause

  completedAt: {
    type: Date,
  },

  // Legacy fields for backward compatibility
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

export const Analysis = mongoose.model("Analysis", AnalysisSchema);
