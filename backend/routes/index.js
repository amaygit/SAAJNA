import express from 'express';
import authRoutes from "./auth.js";
import workspaceRoutes from "./workspace.js";
import projectRoutes from "./project.js";
import taskRoutes from "./task.js";
import userRoutes from "./user.js";
import aiRoutes from "./ai.js";
const router = express.Router();

router.use('/workspaces', workspaceRoutes);
router.use('/auth', authRoutes);
router.use('/projects',projectRoutes)
router.use("/tasks",taskRoutes)
// router.use("/settings",taskRoutes)
router.use("/users",userRoutes)

router.use("/ai", aiRoutes);



export default router;