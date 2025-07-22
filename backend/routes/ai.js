// routes/ai.js
import express from "express";
import { askLawAI } from "../controllers/ai.js";

const router = express.Router();

router.post("/ask", askLawAI);

export default router;
