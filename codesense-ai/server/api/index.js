import app from "../server.js";
import { connectDB } from "../config/db.js";

export default async function handler(req, res) {
  // Fire connection attempt in background without blocking
  connectDB().catch(() => {});
  return app(req, res);
}
