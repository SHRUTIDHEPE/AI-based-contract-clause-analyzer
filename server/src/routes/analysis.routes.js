import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { runAnalysis, getAnalysis, getAnalysisByContract } from "../controllers/analysis.controllers.js";

const router = Router();

router.route("/run/:contractId").post(verifyJWT, runAnalysis);
router.route("/:analysisId").get(verifyJWT, getAnalysis);
router.route("/contract/:contractId").get(verifyJWT, getAnalysisByContract);

export default router;
