import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citedFiles: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
