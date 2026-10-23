import mongoose from "mongoose";

let isConnecting = false;

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes("YOUR_DATABASE_PASSWORD") || uri.includes("<password>")) {
    return false;
  }
  
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log("[MongoDB] Connected successfully");
    return true;
  } catch (err) {
    console.warn("[MongoDB] Could not connect to Atlas, using memory fallback:", err.message);
    return false;
  }
}

