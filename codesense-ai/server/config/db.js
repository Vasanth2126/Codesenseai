import mongoose from "mongoose";

let isConnecting = false;

export async function connectDB(retries = 3, delayMs = 1500) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("[MongoDB] Warning: MONGO_URI is not set. Database operations will fail until configured.");
    return false;
  }
  
  // Return immediately if already connected (vital for serverless reuse)
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (mongoose.connection.readyState >= 1) return true;
  }

  isConnecting = true;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      isConnecting = false;
      console.log("[MongoDB] Connected successfully");
      return true;
    } catch (err) {
      console.error(`[MongoDB] Connection attempt ${attempt}/${retries} failed:`, err.message);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  isConnecting = false;
  console.error("[MongoDB] Could not establish MongoDB connection after retries. Verify MONGO_URI and Network Access in MongoDB Atlas.");
  return false;
}

