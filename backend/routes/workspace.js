import express from 'express';
import { validateRequest } from 'zod-express-middleware';
import {  inviteMemberSchema,
  tokenSchema,workspaceSchema } from '../libs/validate-schema.js';
import authMiddleware from '../middleware/auth-middleware.js';
import { createWorkspace,deleteWorkspace,getWorkspaceDetails,getWorkspaceProjects,getWorkspaces, getWorkspaceStats, inviteUserToWorkspace, updateWorkspace, acceptInviteByToken, acceptGenerateInvite } from '../controllers/workspace.js';
import { z } from "zod";
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
router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptInviteByToken
);
router.post(
  "/:workspaceId/accept-generate-invite",
  authMiddleware,
  validateRequest({ params: z.object({ workspaceId: z.string() }) }),
  acceptGenerateInvite
);

router.post(
  "/:workspaceId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToWorkspace
);

router.delete("/:workspaceId", authMiddleware, deleteWorkspace);
router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats);

export default router;