import express from 'express';
import { validateRequest } from 'zod-express-middleware';
import { workspaceSchema } from '../libs/validate-schema.js';
import authMiddleware from '../middleware/auth-middleware.js';
import { createWorkspace,deleteWorkspace,getWorkspaceDetails,getWorkspaceProjects,getWorkspaces, getWorkspaceStats, updateWorkspace } from '../controllers/workspace.js';

const router = express.Router();

router.post(
    "/",authMiddleware,
    validateRequest({ body: workspaceSchema }),
    createWorkspace);

router.get("/",authMiddleware, getWorkspaces);
router.get("/:workspaceId",authMiddleware, getWorkspaceDetails);
router.get("/:workspaceId/projects",authMiddleware, getWorkspaceProjects);
router.put(
  "/:workspaceId",
  authMiddleware,
  validateRequest({ body: workspaceSchema }),
  updateWorkspace
);

router.delete("/:workspaceId", authMiddleware, deleteWorkspace);
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

export default router;