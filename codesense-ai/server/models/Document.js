import mongoose from "mongoose";

// Represents a single indexed chunk of a source file within a project.
// embedding is stored as a plain array; for production scale, swap this
// collection out for a dedicated vector DB (Pinecone, Qdrant, Chroma, etc.)
const documentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    filePath: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
