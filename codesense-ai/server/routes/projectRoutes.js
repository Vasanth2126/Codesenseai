import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import {
  createFromGithub,
  createFromUpload,
  listProjects,
  getProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(requireAuth);
router.get("/", listProjects);
router.post("/github", createFromGithub);
router.post("/upload", upload.array("files", 200), createFromUpload);
router.get("/:id", getProject);
router.delete("/:id", deleteProject);

export default router;
