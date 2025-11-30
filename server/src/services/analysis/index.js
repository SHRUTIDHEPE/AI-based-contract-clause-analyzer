// server/services/analysis/analysisService.js
const Analysis = require("../../models/Analysis");
const Notification = require("../../models/Notification");
const AuditLog = require("../../models/AuditLog");
const { downloadPdfFromUrl } = require("../../utils/downloadPdf");
const { extractTextFromPdfBuffer } = require("../../utils/pdfExtractor");
const { splitIntoClauses } = require("../../utils/clauseSplitter");
const { predictBatched } = require("./mlClient");
const { buildClauseResult } = require("./clauseAnalysis");
const { computeContractSummary } = require("./summaryEngine");

async function analyzeContract(contract, userId) {
  // 1. Download PDF
  const pdfUrl = contract.cloudinaryUrl;
  if (!pdfUrl) throw new Error("No cloudinaryUrl on contract");

  const buffer = await downloadPdfFromUrl(pdfUrl);
  if (!buffer) throw new Error("Failed to download PDF");

  // 2. Extract text
  const text = await extractTextFromPdfBuffer(buffer);
  if (!text || !text.trim()) throw new Error("No text extracted from PDF");

  // 3. Split into clauses
  const clauses = splitIntoClauses(text);

  // Optionally store clauses into contract (if you want)
  // contract.clauses = clauses; await contract.save();

  // 4. Batch predict
  const mlResponses = await predictBatched(clauses); // array same length (or nulls)

  // 5. Build clause results
  const results = [];
  for (let i = 0; i < clauses.length; i++) {
    const clauseText = clauses[i];
    const mlRes = mlResponses ? mlResponses[i] : null;
    const resObj = buildClauseResult(i, clauseText, mlRes);
    results.push(resObj);
  }

  // 6. Contract summary
  const { finalRiskScore, finalDrift } = computeContractSummary(results);

  // 7. Save Analysis doc
  const analysis = await Analysis.create({
    contractId: contract._id,
    clauses,
    results,
    riskScore: finalRiskScore,
    driftType: finalDrift
  });

  // 8. Notification if high-risk
  if (finalRiskScore >= 70) {
    await Notification.create({
      userId,
      contractId: contract._id,
      analysisId: analysis._id,
      message: "⚠ High-risk contract detected"
    });
  }

  // 9. Audit log
  await AuditLog.create({
    userId,
    action: "analyse",
    details: `Contract ${contract._id} analyzed`,
    timestamp: new Date()
  });

  return analysis;
}

module.exports = { analyzeContract };
