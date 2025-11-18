import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  getUserAuditLogs,
  clearAuditLogs,
} from "../controllers/auditlog.controllers.js";

const router = Router();

router.get("/my-logs", verifyJWT, getUserAuditLogs);
router.delete("/clear", verifyJWT, clearAuditLogs);

export default router;
