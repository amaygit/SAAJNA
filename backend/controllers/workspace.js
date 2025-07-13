import Workspace from "../models/workspace.js";
import Project from "../models/project.js";

const createWorkspace = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const workspace = await Workspace.create({
            name,
            description,
            color,
            owner: req.user._id,
            members: [
                {
                    user: req.user._id,
                    role: "owner",
                    joinedAt: new Date(),
                }
            ]
        });

        res.status(201).json(workspace);

    } catch (error) {
        console.error(error);
        res.status(500)({
            message: "Internal Server Error"
        })
    }
};

const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            "members.user": req.user._id,
        }).sort({ createdAt: -1 });
        res.status(200).json(workspaces)
    } catch (error) {
        console.log(error);
        res.status(500)({
            message: "Internal Server Error"
        })
    }
}

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById({
      _id: workspaceId,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json(workspace);
  } catch (error) {}
};



const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    }).populate("members.user", "name email profilePicture");

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      members: { $elemMatch: { user: req.user._id } },
    })
      .populate("tasks", "status")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, color } = req.body;

    const workspace = await Workspace.findOneAndUpdate(
      { _id: workspaceId, owner: req.user._id }, // only allow owner to update
      { name, description, color },
      { new: true, runValidators: true }
    );

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found or not authorized" });
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOneAndDelete({
      _id: workspaceId,
      owner: req.user._id, // only allow owner to delete
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found or not authorized" });
    }

    // Optional: delete associated projects or clean up
    await Project.deleteMany({ workspace: workspaceId });

    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export { createWorkspace, getWorkspaces, getWorkspaceDetails, getWorkspaceProjects,updateWorkspace,deleteWorkspace };