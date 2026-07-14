import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    sourceType: { type: String, enum: ["github", "upload"], required: true },
    sourceRef: { type: String, required: true }, // github URL or upload batch id
    status: {
      type: String,
      enum: ["pending", "indexing", "ready", "failed"],
      default: "pending",
    },
    fileCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
