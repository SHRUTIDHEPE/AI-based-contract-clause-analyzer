import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { analyzeContract } from "../services/analysis.service.js";
import { Analysis } from "../models/analysis.models.js";
import { apiError } from "../utils/apiError.js";

const runAnalysis = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  const analysis = await analyzeContract(contractId, req.user.id);

  return res
    .status(200)
    .json(new apiResponse(200, analysis, "Analysis completed successfully"));
});

const getAnalysis = asyncHandler(async (req, res) => {
  const { analysisId } = req.params;

  const analysis = await Analysis.findById(analysisId);

  if (!analysis) {
    throw new apiError(404, "Analysis not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, analysis, "Analysis fetched successfully"));
});

const getAnalysisByContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  const analysis = await Analysis.findOne({ contractId });

  if (!analysis) {
    throw new apiError(404, "Analysis not found for this contract");
  }

  return res
    .status(200)
    .json(new apiResponse(200, analysis, "Analysis fetched successfully"));
});

export { runAnalysis, getAnalysis, getAnalysisByContract };
