import express from "express";
import { validateRequest } from "zod-express-middleware";
import {
  projectSchema,
  inviteMemberSchema,
  tokenSchema,
} from "../libs/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { z } from "zod";
import {
  createProject,
  getProjectDetails,
  getProjectTasks,
  deleteProject,
  inviteUserToProject,
  acceptProjectInviteByToken,
  acceptProjectInviteManually,
} from "../controllers/project.js";

const router = express.Router();

router.post(
  "/:workspaceId/create-project",
  authMiddleware,
  validateRequest({
    params: z.object({ workspaceId: z.string() }),
    body: projectSchema,
  }),
  createProject
);

router.get("/", authMiddleware); // optional if you want to list all projects (filter by workspace in controller)

router.get("/:projectId", authMiddleware, validateRequest({
  params: z.object({ projectId: z.string() }),
}), getProjectDetails);

router.get("/:projectId/tasks", authMiddleware, validateRequest({
  params: z.object({ projectId: z.string() }),
}), getProjectTasks);

router.put("/:projectId", authMiddleware, validateRequest({
  params: z.object({ projectId: z.string() }),
  body: projectSchema,
}), createProject); // you may want a separate `updateProject` controller here

router.delete("/:projectId", authMiddleware, validateRequest({
  params: z.object({ projectId: z.string() }),
}), deleteProject);

// Invite project member
router.post(
  "/:projectId/invite-member",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
    body: inviteMemberSchema,
  }),
  inviteUserToProject
);

// Accept invite using token
router.post(
  "/accept-invite-token",
  authMiddleware,
  validateRequest({ body: tokenSchema }),
  acceptProjectInviteByToken
);

// Generate + accept invite link
router.post(
  "/:projectId/accept-generate-invite",
  authMiddleware,
  validateRequest({
    params: z.object({ projectId: z.string() }),
  }),
  acceptProjectInviteManually
);

export default router;
