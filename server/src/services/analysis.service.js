import { downloadPdf } from "../utils/downloadpdf.js";
import { extractText } from "../utils/pdfExtractor.js";
import { splitIntoClauses } from "../utils/clauseSplitter.js";
import { predictClauses } from "./analysis/mlClient.js";
import { computeClauseRisk } from "./analysis/riskEngine.js";
import { detectDrift } from "./analysis/driftEngine.js";
import { generateSummary } from "./analysis/summaryEngine.js";
import { Analysis } from "../models/analysis.models.js";
import { Contract } from "../models/contract.models.js";
import {Notification} from "../models/notification.models.js";
import {AuditLog} from "../models/auditLog.models.js";
import { apiError } from "../utils/apiError.js";

/**
 * Orchestrates the full analysis of a contract.
 *
 * @param {string} contractId - The ID of the contract to analyze.
 * @param {string} userId - The ID of the user requesting the analysis.
 * @returns {Promise<object>} The full analysis report.
 */
export const analyzeContract = async (contractId, userId) => {
  console.log("🔍 [analyzeContract] Starting analysis for contractId:", contractId, "userId:", userId);
  const contract = await Contract.findById(contractId);
  console.log("🔍 [analyzeContract] Contract found:", !!contract);
  if (!contract) {
    throw new apiError(404, "Contract not found");
  }

  // Check if the contract belongs to the user
  console.log("🔍 [analyzeContract] Contract uploadedBy:", contract.uploadedBy, "request userId:", userId);
  if (contract.uploadedBy.toString() !== userId) {
    throw new apiError(403, "Unauthorized to analyze this contract");
  }
  console.log("🔍 [analyzeContract] Ownership check passed");

  // 1. Download the PDF
  console.log("🔍 [analyzeContract] About to download PDF from:", contract.cloudinaryUrl);
  const pdfBuffer = await downloadPdf(contract.cloudinaryUrl);
  if (!pdfBuffer) {
    throw new apiError(500, "Failed to download PDF from Cloudinary");
  }

  // 2. Extract text
  console.log("🔍 [analyzeContract] About to extract text from PDF");
  const text = await extractText(pdfBuffer);
  console.log("🔍 [analyzeContract] Text extracted, length:", text?.length || 0);
  if (!text || text.trim().length === 0) {
    throw new apiError(500, "Failed to extract text from PDF - PDF may be corrupted or empty");
  }

  // 3. Split into clauses
  console.log("🔍 [analyzeContract] About to split text into clauses");
  const clauses = splitIntoClauses(text);
  console.log("🔍 [analyzeContract] Clauses split, count:", clauses.length);

  // 4. Send clauses to ML server for batch prediction
  console.log("🔍 [analyzeContract] About to send clauses to ML server");
  const predictions = await predictClauses(clauses);
  console.log("🔍 [analyzeContract] Predictions received from ML server");

  // 5, 6, 7. Analyze each clause
  console.log("🔍 [analyzeContract] About to analyze each clause");
  const analysisResults = clauses.map((clauseText, index) => {
    const prediction = predictions[index];
    const confidence = Math.max(...prediction.probabilities);
    const { riskScore } = computeClauseRisk(prediction.label, confidence);
    const drift = detectDrift(clauseText);

    const result = {
      clause: clauseText,
      label: prediction.label.toString(),
      confidence: isNaN(confidence) ? 0 : confidence,
      riskScore: isNaN(riskScore) ? 0 : riskScore,
      drift,
    };
    console.log(`🔍 [analyzeContract] Clause ${index} result:`, result);
    return result;
  });
  console.log("🔍 [analyzeContract] All clauses analyzed, results count:", analysisResults.length);

  // 8. Generate summary
  console.log("🔍 [analyzeContract] About to generate summary");
  const summary = generateSummary(analysisResults);
  console.log("🔍 [analyzeContract] Summary generated");

  const validRiskScores = analysisResults.filter(r => !isNaN(r.riskScore));
  const overallRiskScore = validRiskScores.length > 0
    ? validRiskScores.reduce((acc, r) => acc + r.riskScore, 0) / validRiskScores.length
    : 0;
  console.log("🔍 [analyzeContract] Overall risk score calculated:", overallRiskScore);

  // 9. Store results in the database
  console.log("🔍 [analyzeContract] About to store analysis in database");
  const analysis = await Analysis.create({
    contractId,
    status: "completed",
    summary,
    overallRiskScore: overallRiskScore,
    clauses: analysisResults,
    completedAt: new Date(),
  });
  console.log("🔍 [analyzeContract] Analysis stored in database, id:", analysis._id);

  // Update contract status
  console.log("🔍 [analyzeContract] About to update contract status");
  contract.status = "completed";
  await contract.save();
  console.log("🔍 [analyzeContract] Contract status updated");

  // Create notification if high risk
  if (overallRiskScore >= 70) {
    console.log("🔍 [analyzeContract] Creating high-risk notification");
    await Notification.create({
      userId,
      contractId,
      analysisId: analysis._id,
      message: `High-risk contract detected (score ${overallRiskScore}).`,
      isRead: false,
      createdAt: new Date(),
    });
    console.log("🔍 [analyzeContract] High-risk notification created");
  }

  // Create audit log
  console.log("🔍 [analyzeContract] Creating audit log");
  await AuditLog.create({
    userId,
    action: "analyse",
    details: `Ran analysis for contract ${contractId}`,
    timestamp: new Date(),
  });
  console.log("🔍 [analyzeContract] Audit log created");

  console.log("🔍 [analyzeContract] Analysis completed successfully");
  return analysis;
};
