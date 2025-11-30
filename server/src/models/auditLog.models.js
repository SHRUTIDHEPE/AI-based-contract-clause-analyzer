import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["upload", "analyse", "view_report", "login", "delete", "register"],
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

// Pagination support
auditLogSchema.plugin(mongooseAggregatePaginate);

// Helpful indexes
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });

//export default mongoose.model("AuditLog", auditLogSchema);
 export const AuditLog = mongoose.model("AuditLog", auditLogSchema);