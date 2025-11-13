import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const contractSchema = new Schema(
  {
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String, // local file path or fallback path
      required: true,
    },
    cloudinaryUrl: {
      type: String, // hosted file URL on Cloudinary
      default: "",
    },
    cloudinaryPublicId: {
      type: String, // used for deleting/updating the file on Cloudinary
      default: "",
    },
    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Optional plugin for pagination or aggregation queries
contractSchema.plugin(mongooseAggregatePaginate);

export const Contract = mongoose.model("Contract", contractSchema);
