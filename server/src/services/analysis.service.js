import { downloadPdf } from "../utils/downloadpdf.js";
import { extractText } from "../utils/pdfExtractor.js";
import { splitIntoClauses } from "../utils/clauseSplitter.js";
import { predictClauses } from "./analysis/mlClient.js";
import { computeClauseRisk } from "./analysis/riskEngine.js";
import { detectDrift } from "./analysis/driftEngine.js";
import { generateSummary } from "./analysis/summaryEngine.js";
import { Analysis } from "../models/analysis.models.js";
import { Contract } from "../models/contract.models.js";
import { Notification } from "../models/notification.models.js";
import { AuditLog } from "../models/auditLog.models.js";
import { apiError } from "../utils/apiError.js";

export const analyzeContract = async (contractId, userId) => {
  console.log("🔍 Starting analysis for:", contractId, "user:", userId);

  // ---------------------------
  // Fetch contract
  // ---------------------------
  const contract = await Contract.findById(contractId);
  if (!contract) throw new apiError(404, "Contract not found");

  if (contract.uploadedBy.toString() !== userId)
    throw new apiError(403, "Unauthorized to analyze this contract");

  // ---------------------------
  // Download PDF
  // ---------------------------
  console.log("📥 Downloading PDF from:", contract.cloudinaryUrl);
  const pdfBuffer = await downloadPdf(contract.cloudinaryUrl);
  if (!pdfBuffer) throw new apiError(500, "Failed to download PDF");

  // ---------------------------
  // Extract Text
  // ---------------------------
  const text = await extractText(pdfBuffer);
  console.log("📄 Extracted text length:", text?.length ?? 0);

  if (!text || text.trim().length === 0)
    throw new apiError(500, "Failed to extract text from PDF");

  // ---------------------------
  // Split into clauses
  // ---------------------------
  const clauses = splitIntoClauses(text);
  console.log("✂️ Split into clauses:", clauses.length);

  if (clauses.length === 0)
    throw new apiError(500, "No clauses found in the document");

  // ---------------------------
  // Predict using ML server
  // ---------------------------
  console.log("🤖 Sending clauses to ML server...");
  const predictions = await predictClauses(clauses);
  console.log("🤖 Predictions received:", predictions.length);

  if (!predictions || predictions.length !== clauses.length)
    throw new apiError(500, "ML server returned invalid predictions");

  // ---------------------------
  // Build clause-by-clause analysis
  // ---------------------------
  const analysisResults = clauses.map((clauseText, index) => {
    const pred = predictions[index];

    if (!pred) {
      console.warn("⚠ Missing prediction at index:", index);
      return {
        clause: clauseText,
        label: "UNKNOWN",
        confidence: 0,
        riskScore: 0,
        drift: {},
      };
    }

    // Extract model output
    const clauseType = pred.clause_type;
    const confidence = pred.confidence;

    // Use risk score from ML service if available, otherwise compute
    const { riskScore } = computeClauseRisk(clauseType, confidence, clauseText, pred.risk_score);

    const drift = detectDrift(clauseText);

    const result = {
      clause: clauseText,
      label: clauseType,
      confidence: confidence || 0,
      riskScore: riskScore || 0,
      drift,
    };

    console.log(`🔎 Clause ${index}:`, result);
    return result;
  });

  // ---------------------------
  // Summary + overall score
  // ---------------------------
  const summary = generateSummary(analysisResults);

  const validScores = analysisResults.map(r => r.riskScore).filter(x => !isNaN(x));
  const overallRiskScore =
    validScores.reduce((a, b) => a + b, 0) / validScores.length;

  console.log("📊 Overall risk score:", overallRiskScore);

  // ---------------------------
  // Save analysis
  // ---------------------------
  const analysis = await Analysis.create({
    contractId,
    status: "completed",
    summary,
    overallRiskScore,
    clauses: analysisResults,
    completedAt: new Date(),
  });

  // Update contract
  contract.status = "completed";
  await contract.save();

  // High-risk notification
  if (overallRiskScore >= 70) {
    await Notification.create({
      userId,
      contractId,
      analysisId: analysis._id,
      message: `High-risk contract detected (Score ${overallRiskScore}).`,
      isRead: false,
      createdAt: new Date(),
    });
  }

  // Audit log
  await AuditLog.create({
    userId,
    action: "analyse",
    details: `Ran analysis for contract ${contractId}`,
    timestamp: new Date(),
  });

  return analysis;
};
