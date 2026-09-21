import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { askQuestion, streamQuestion, getHistory, generateReadme } from "../controllers/chatController.js";

const router = express.Router();

router.use(requireAuth);
router.post("/:id/ask", askQuestion);
router.post("/:id/stream", streamQuestion);
router.get("/:id/history", getHistory);
router.post("/:id/readme", generateReadme);

export default router;