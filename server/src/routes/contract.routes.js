import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

import {
  uploadContract,
  getUserContracts,
  deleteContract,
  getContractById,
} from "../controllers/contract.controllers.js";

const router = Router();

// all routes require user to be logged in

//  Upload a new contract (PDF/DOCX/etc.)
router
  .route("/upload")
  .post(verifyJWT, upload.single("contractFile"), uploadContract);

//  Get paginated list of logged-in user's contracts
router
  .route("/my-contracts")
  .get(verifyJWT, getUserContracts);

//  Get a specific contract with full details
router
  .route("/:contractId")
  .get(verifyJWT, getContractById);

//  Delete a contract (also removes from Cloudinary & audit log entry)
router
  .route("/:contractId")
  .delete(verifyJWT, deleteContract);

export default router;
