import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import ProjectInvite from "../models/projectInvite.js";
import crypto from "crypto";
const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const tagArray = tags ? tags.split(",") : [];

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members,
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject._id);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Check if requester is a member
    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove project ref from workspace
    await Workspace.findByIdAndUpdate(project.workspace, {
      $pull: { projects: project._id },
    });

    // Delete all tasks inside the project
    await Task.deleteMany({ project: projectId });

    // Delete the project
    await project.deleteOne();

    return res.status(200).json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Send project invite
// const inviteUserToProject = async (req, res) => {
//   try {
//     const { email, role } = req.body;
//     const { projectId } = req.params;

//     const project = await Project.findById(projectId);
//     if (!project) return res.status(404).json({ message: "Project not found" });

//     const isMember = project.members.some(
//       (member) => member.user.toString() === req.user._id.toString()
//     );
//     if (!isMember) return res.status(403).json({ message: "Unauthorized" });

//     const invitedUser = await User.findOne({ email });
//     if (!invitedUser) return res.status(404).json({ message: "User not found" });

//     // Already a member?
//     const alreadyMember = project.members.some(
//       (member) => member.user.toString() === invitedUser._id.toString()
//     );
//     if (alreadyMember)
//       return res.status(400).json({ message: "User already a member of this project" });

//     // Create unique token
//     const token = crypto.randomBytes(32).toString("hex");

//     await ProjectInvite.create({
//       user: invitedUser._id,
//       projectId,
//       token,
//       role,
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//     });

//     // TODO: send email here with `accept/project/${token}` link
//     const workspaceId = project.workspace.toString(); // assuming project has a `workspace` field

// const invitationLink = `${process.env.FRONTEND_URL}/workspaces/${workspaceId}/projects/${projectId}/invite?tk=${token}`;


//     return res.status(200).json({ message: "Invitation sent" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const inviteUserToProject = async (req, res) => {
  try {
    const { email, role } = req.body;
    const { projectId } = req.params;

    // Validate role
    const validRoles = ["manager", "contributor", "viewer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if sender is a member
    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: "Unauthorized" });

    // Find invited user
    const invitedUser = await User.findOne({ email });
    if (!invitedUser)
      return res.status(404).json({ message: "User not found" });

    // Already a member?
    const alreadyMember = project.members.some(
      (member) => member.user.toString() === invitedUser._id.toString()
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User already a member of this project" });

    // Already invited?
    const existingInvite = await ProjectInvite.findOne({
      user: invitedUser._id,
      projectId,
    });
    if (existingInvite) {
      return res.status(400).json({ message: "User already invited to this project" });
    }

    // Create unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Save invite
    await ProjectInvite.create({
      user: invitedUser._id,
      projectId,
      token,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const workspaceId = project.workspace.toString();
    const invitationLink = `${process.env.FRONTEND_URL}/workspaces/${workspaceId}/projects/${projectId}/invite?tk=${token}`;

    // TODO: Send email with invitationLink
    console.log(`Invitation Link: ${invitationLink}`);

    return res.status(200).json({ message: "Invitation sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept invite via token (from email)
const acceptProjectInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await ProjectInvite.findOne({ token });

    if (!invite || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired invite token" });
    }

    const project = await Project.findById(invite.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Add user to project members
    project.members.push({ user: invite.user, role: invite.role });
    await project.save();

    // Delete invite
    await invite.deleteOne();

    return res.status(200).json({ message: "Successfully joined project" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept invite (dashboard/manual accept)
const acceptProjectInviteManually = async (req, res) => {
  try {
    const { inviteId } = req.body;

    const invite = await ProjectInvite.findById(inviteId);
    if (!invite || invite.user.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Invalid invite" });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invite expired" });
    }

    const project = await Project.findById(invite.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.members.push({ user: invite.user, role: invite.role });
    await project.save();

    await invite.deleteOne();

    return res.status(200).json({ message: "Successfully joined project" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createProject, getProjectDetails, getProjectTasks, deleteProject,inviteUserToProject, acceptProjectInviteByToken, acceptProjectInviteManually };


