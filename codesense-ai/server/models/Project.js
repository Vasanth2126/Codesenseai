import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    _id: { type: String },
    owner: { type: mongoose.Schema.Types.Mixed, required: true },
    name: { type: String, required: true, trim: true },
    sourceType: { type: String, enum: ["github", "upload"], required: true },
    sourceRef: { type: String, required: true }, // github URL or upload batch id
    status: {
      type: String,
      enum: ["pending", "indexing", "ready", "failed"],
      default: "ready",
    },
    fileCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
