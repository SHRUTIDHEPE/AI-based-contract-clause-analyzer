import mongoose from "mongoose";
import { Contract } from "../models/contract.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { Notification } from "../models/notification.models.js";
import { createAuditLog } from "../services/auditlog.service.js";   // 🔥 unified audit log
  

// =============================
// Upload Contract
// =============================
const uploadContract = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    //console.log("Debug: req.file =", req.file);

    if (!req.file) {
        throw new apiError(400, "Contract file is required");
    }

    const uploadResult = await uploadOnCloudinary(req.file.path);

    //console.log("Debug: uploadResult =", uploadResult);

    if (!uploadResult?.secure_url) {
        throw new apiError(500, "Failed to upload contract to Cloudinary");
    }

    const contract = await Contract.create({
        uploadedBy: userId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        status: "uploaded",
        uploadedAt: new Date()
    });

    //  AUDIT LOG
    await createAuditLog(userId, "upload", `Uploaded contract ${contract.fileName}`);

    //  Notification
    await Notification.create({
        userId,
        contractId: contract._id,
        message: "Your contract has been uploaded and is ready for analysis.",
        createdAt: new Date(),
        isRead: false
    });

    return res
        .status(201)
        .json(new apiResponse(201, contract, "Contract uploaded successfully"));
});


// =============================
// Get User Contracts (Paginated)
// =============================
const getUserContracts = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
        { $match: { uploadedBy: userId } },
        { $sort: { uploadedAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        }
    ];

    const result = await Contract.aggregate(pipeline);

    const total = result[0].metadata[0]?.total || 0;
    const contracts = result[0].data;

    return res.status(200).json(
        new apiResponse(200, {
            total,
            page,
            totalPages: Math.ceil(total / limit),
            contracts
        }, "User contracts fetched successfully")
    );
});


// =============================
// Get Contract by ID
// =============================
const getContractById = asyncHandler(async (req, res) => {
    const contractId = new mongoose.Types.ObjectId(req.params.contractId);

    const pipeline = [
        { $match: { _id: contractId } },
        {
            $lookup: {
                from: "users",
                localField: "uploadedBy",
                foreignField: "_id",
                as: "uploadedByUser"
            }
        },
        { $unwind: "$uploadedByUser" },
        {
            $project: {
                fileName: 1,
                cloudinaryUrl: 1,
                status: 1,
                uploadedAt: 1,
                "uploadedByUser.username": 1,
                "uploadedByUser.email": 1
            }
        }
    ];

    const result = await Contract.aggregate(pipeline);

    if (result.length === 0) {
        throw new apiError(404, "Contract not found");
    }

    //  AUDIT LOG (view contract)
    await createAuditLog({
        userId: req.user._id,
        action: "view_report",
        details: `Viewed contract details for ${req.params.contractId}`
    });

    return res.status(200).json(
        new apiResponse(200, result[0], "Contract details fetched successfully")
    );
});


// =============================
// Delete Contract
// =============================
const deleteContract = asyncHandler(async (req, res) => {
    const contractId = req.params.contractId;

    const contract = await Contract.findById(contractId);
    if (!contract) throw new apiError(404, "Contract not found");

    // Delete file from Cloudinary
    if (contract.cloudinaryPublicId) {
        await deleteFromCloudinary(contract.cloudinaryPublicId);
    }

    await contract.deleteOne();

    //  AUDIT LOG
    await createAuditLog({
        userId: req.user._id,
        action: "delete",
        details: `Deleted contract ${contract.fileName}`
    });

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Contract deleted successfully"));
});

export {
    uploadContract,
    getUserContracts,
    getContractById,
    deleteContract
};
