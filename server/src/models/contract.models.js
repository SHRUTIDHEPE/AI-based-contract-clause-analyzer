import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const contractSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    cloudinaryUrl: {
      type: String,
      default: null,
    },

    cloudinaryPublicId: {
      type: String,
      default: null,
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
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Add pagination plugin
contractSchema.plugin(mongooseAggregatePaginate);

// Export model
export const Contract = mongoose.model("Contract", contractSchema);
