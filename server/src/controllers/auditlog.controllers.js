import { AuditLog } from "../models/auditLog.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

 const getUserAuditLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const aggregateQuery = AuditLog.aggregate([
    { $match: { userId } },
    { $sort: { timestamp: -1 } },
  ]);

  const logs = await AuditLog.aggregatePaginate(aggregateQuery, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new apiResponse(200, logs, "Audit logs fetched successfully"));
});

 const clearAuditLogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await AuditLog.deleteMany({ userId });

  return res
    .status(200)
    .json(new apiResponse(200, null, "All audit logs cleared"));
});
export {
  getUserAuditLogs,
  clearAuditLogs,
}