import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Contract } from "../models/contract.models.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { createAuditLog } from "../services/auditlog.service.js";   // 🔥 AUDIT IMPORT

// Helper to generate tokens
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new apiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new apiError(500, "Error generating access and refresh tokens");
  }
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (!username || !email || !fullName || !password) {
    throw new apiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new apiError(409, "User with this email or username already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //  AUDIT LOG
  await createAuditLog({
    userId: user._id,
    action: "upload",
    details: "New user registered"
  });

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!password || (!email && !username)) {
    throw new apiError(400, "Email/username and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //  AUDIT LOG
  await createAuditLog({
    userId: user._id,
    action: "login",
    details: "User logged in successfully"
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful")
    );
});

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Refresh token required");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new apiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    //  AUDIT LOG
    await createAuditLog({
      userId: user._id,
      action: "login",
      details: "Access token refreshed"
    });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new apiError(401, "Invalid or expired refresh token");
  }
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  //  AUDIT LOG
  await createAuditLog({
    userId: req.user._id,
    action: "login",
    details: "User logged out"
  });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "Logged out successfully"));
});

// Change Password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new apiError(400, "Both old and new passwords are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new apiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) throw new apiError(401, "Old password is incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  //  AUDIT LOG
  await createAuditLog({
    userId: req.user._id,
    action: "upload",
    details: "User changed password"
  });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"));
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "Current user fetched successfully"));
});

// Update Profile
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new apiError(400, "Full name and email are required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password -refreshToken");

  //  AUDIT LOG
  await createAuditLog({
    userId: req.user._id,
    action: "upload",
    details: "User updated profile details"
  });

  return res
    .status(200)
    .json(new apiResponse(200, updatedUser, "Profile updated successfully"));
});

const getUserAccountDetails = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const userStats = await User.aggregate([
    { $match: { _id: userId } },
    {
      $lookup: {
        from: "contracts",
        localField: "_id",
        foreignField: "uploadedBy",
        as: "contracts",
      },
    },
    {
      $addFields: {
        totalContracts: { $size: "$contracts" },
        lastUpload: { $max: "$contracts.createdAt" },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullName: 1,
        createdAt: 1,
        totalContracts: 1,
        lastUpload: 1,
      },
    },
  ]);

  if (!userStats?.length) throw new apiError(404, "User not found");

  return res
    .status(200)
    .json(new apiResponse(200, userStats[0], "User account details fetched successfully"));
});

const deleteUserContract = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { contractId } = req.params;

  if (!userId || !contractId) {
    throw new apiError(400, "Missing userId or contractId");
  }

  const contract = await Contract.findOne({ _id: contractId, uploadedBy: userId });
  if (!contract) {
    throw new apiError(404, "Contract not found or unauthorized");
  }

  // remove contract + linked analysis + notifications
  await Promise.all([
    Contract.findByIdAndDelete(contractId),
    mongoose.model("Analysis").deleteMany({ contractId }),
    mongoose.model("Notification").deleteMany({ contractId }),
  ]);

  //  AUDIT LOG
  await createAuditLog({
    userId,
    action: "delete",
    details: `Contract ${contractId} deleted`
  });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Contract deleted successfully"));
});

export {
  generateAccessAndRefreshToken,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  deleteUserContract,
  getUserAccountDetails,
};
