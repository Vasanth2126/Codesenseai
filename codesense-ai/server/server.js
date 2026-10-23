import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

// Trust reverse proxy (required for Render / rate limiting)
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin API calls & SSE
  })
);

// Rate limiter: max 150 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again later." },
});
app.use("/api/", apiLimiter);

// Dynamic CORS configuration (supports comma-separated origins, wildcards, and preview URLs)
const configuredOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : [];

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
];

const allowedOrigins = [...new Set([...configuredOrigins, ...defaultOrigins])];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return cb(null, true);
      
      // If configured origin exists or in development mode
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*") ||
        process.env.NODE_ENV !== "production" ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.endsWith(".netlify.app")
      ) {
        return cb(null, true);
      }
      return cb(null, true); // Permissive fallback to prevent deployment CORS blocks
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root route for Render service health check & browser preview
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "CodeSense AI API",
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting/disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  })
);

// Auto-reconnect database on request (non-blocking for fast serverless responses)
app.use((req, res, next) => {
  if (mongoose.connection.readyState < 1) {
    connectDB().catch(() => {});
  }
  next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error("[ServerError]", err);
  res.status(500).json({
    message: "Unexpected server error",
    error: err.message || String(err),
  });
});

export default app;

// Start server when run directly (local / Render / Docker). On Vercel, app is invoked as a serverless handler.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  const HOST = "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(`CodeSense AI API running on http://${HOST}:${PORT}`);
    connectDB();
  });
}


