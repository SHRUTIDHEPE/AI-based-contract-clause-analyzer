// server/src/controllers/analysis.controllers.js
const Analysis = require("../models/Analysis");
const { runAnalysisForContract } = require("../services/analysis/analysisService");
const { buildPagination } = require("../utils/pagination");

// you probably already have something like asyncHandler & buildSuccessResponse;
// adjust imports to match your project helpers.
const asyncHandler = require("../utils/asyncHandler");
const { buildSuccessResponse } = require("../utils/apiResponse");

// POST /api/analysis/run/:contractId
exports.runAnalysis = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const userId = req.user?._id; // assuming auth middleware

  const { analysis, summary } = await runAnalysisForContract(contractId, userId);

  return res.status(200).json(
    buildSuccessResponse("Analysis completed", {
      analysisId: analysis._id,
      summary,
    })
  );
});

// GET /api/analysis/contract/:contractId
exports.getAnalysisByContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  const analysis = await Analysis.findOne({ contractId });
  if (!analysis) {
    return res.status(404).json({ message: "Analysis not found" });
  }

  return res
    .status(200)
    .json(buildSuccessResponse("Analysis fetched", analysis));
});

// GET /api/analysis/:analysisId/clauses?page=&limit=
exports.getClauseResultsPaginated = asyncHandler(async (req, res) => {
  const { analysisId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const analysis = await Analysis.findById(analysisId, { results: 1 });
  if (!analysis) {
    return res.status(404).json({ message: "Analysis not found" });
  }

  const { docs, pagination } = buildPagination(analysis.results, {
    page: Number(page),
    limit: Number(limit),
  });

  return res.status(200).json(
    buildSuccessResponse("Clause results fetched", {
      clauses: docs,
      pagination,
    })
  );
});
