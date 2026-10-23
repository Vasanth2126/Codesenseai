import app from "../server.js";
import { connectDB } from "../config/db.js";

export default async function handler(req, res) {
  // Ensure MongoDB is connected before dispatching to Express
  await connectDB();
  return app(req, res);
}
