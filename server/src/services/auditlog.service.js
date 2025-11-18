import { AuditLog } from "../models/auditLog.models.js";

export const createAuditLog = async (userId, action, details) => {
  try {
    await AuditLog.create({
      userId,
      action,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Audit log creation failed:", error);
  }
};
