// server/src/routes/analysis.routes.js
const express = require("express");
const router = express.Router();

const analysisController = require("../controllers/analysis.controllers");
const auth = require("../middlewares/auth.middlewares");

// run full analysis for a contract
router.post("/run/:contractId", auth, analysisController.runAnalysis);

// get analysis summary & details for contract
router.get("/contract/:contractId", auth, analysisController.getAnalysisByContract);

// get paginated clause-level results
router.get("/:analysisId/clauses", auth, analysisController.getClauseResultsPaginated);

module.exports = router;
