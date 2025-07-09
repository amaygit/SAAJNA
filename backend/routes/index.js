import express from 'express';
import authRoutes from "./auth.js";
import workspaceRoutes from "./workspace.js";
const router = express.Router();

router.use('/workspaces', workspaceRoutes);
router.use('/auth', authRoutes);


export default router;