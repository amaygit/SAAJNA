// routes/ai.js
import express from "express";
import { askLawAI } from "../controllers/ai.js";

const router = express.Router();

// POST /api-v1/ai/ask
router.post("/ask", askLawAI);

export default router;
