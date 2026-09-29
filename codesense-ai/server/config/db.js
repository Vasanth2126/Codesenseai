import mongoose from "mongoose";

export async function connectDB(retries = 5, delayMs = 3000) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("[MongoDB] Warning: MONGO_URI is not set. Database operations will fail until configured.");
    return false;
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log("[MongoDB] Connected successfully");
      return true;
    } catch (err) {
      console.error(`[MongoDB] Connection attempt ${attempt}/${retries} failed:`, err.message);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  console.error("[MongoDB] Could not establish MongoDB connection after retries. Verify MONGO_URI and Network Access in MongoDB Atlas.");
  return false;
}
