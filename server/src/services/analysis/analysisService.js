// server/src/services/analysis/analysisService.js
const Analysis = require("../../models/Analysis");
const Contract = require("../../models/Contract"); // adjust path/name if needed
const Notification = require("../../models/Notification"); // adjust if needed
const AuditLog = require("../../models/AuditLog"); // adjust if needed

const { downloadPdfFromUrl } = require("../../utils/downloadPdf");
const { extractTextFromPdfBuffer } = require("../../utils/pdfExtractor");
const { splitIntoClauses } = require("../../utils/clauseSplitter");

const { analyzeClauses } = require("./clauseAnalysis");
const { buildContractSummary } = require("./summaryEngine");

async function runAnalysisForContract(contractId, userId) {
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new Error("Contract not found");
  }

  const pdfUrl = contract.cloudinaryUrl;
  const pdfBuffer = await downloadPdfFromUrl(pdfUrl);
  if (!pdfBuffer) {
    throw new Error("Failed to download contract PDF");
  }

  const text = await extractTextFromPdfBuffer(pdfBuffer);
  if (!text || !text.trim()) {
    throw new Error("Extracted contract text is empty");
  }

  const clauses = splitIntoClauses(text);
  if (!clauses.length) {
    throw new Error("No clauses extracted from contract text");
  }

  const {
    results,
    contractRiskScore,
    contractDriftType,
  } = await analyzeClauses(clauses);

  const analysis = await Analysis.findOneAndUpdate(
    { contractId },
    {
      contractId,
      clauses,
      results,
      riskScore: contractRiskScore,
      driftType: contractDriftType,
      analysedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  contract.status = "completed";
  await contract.save();

  if (contractRiskScore >= 70) {
    await Notification.create({
      userId,
      contractId,
      analysisId: analysis._id,
      message: `High-risk contract detected (score ${contractRiskScore}).`,
      isRead: false,
      createdAt: new Date(),
    });
  }

  await AuditLog.create({
    userId,
    action: "analyse",
    details: `Ran analysis for contract ${contractId}`,
    timestamp: new Date(),
  });

  const summary = buildContractSummary(results, contractRiskScore, contractDriftType);

  return { analysis, summary };
}

module.exports = { runAnalysisForContract };
