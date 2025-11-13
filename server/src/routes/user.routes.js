import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  deleteUserContract,
  getUserAccountDetails,
} from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

// Unsecured routes (no token required)
router.route("/register").post(upload.none(), registerUser);
router.route("/login").post(upload.none(), loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Secured routes (JWT required)
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Get user account details (like Vidtube’s /c/:username)
router.route("/c/:username").get(verifyJWT, getUserAccountDetails);

// Delete a specific contract
router.route("/contracts/:contractId").delete(verifyJWT, deleteUserContract);

export default router;
