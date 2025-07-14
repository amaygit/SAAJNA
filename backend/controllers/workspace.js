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
//dashboard stats
import mongoose from "mongoose"; // make sure this import is at the top

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // ✅ Validate workspaceId format before querying DB
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate("tasks", "title status dueDate project updatedAt isArchived priority")
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce((acc, project) => acc + project.tasks.length, 0);
    const tasks = projects.flatMap((project) => project.tasks);

    const totalTaskCompleted = tasks.filter((task) => task.status === "Done").length;
    const totalTaskToDo = tasks.filter((task) => task.status === "To Do").length;
    const totalTaskInProgress = tasks.filter((task) => task.status === "In Progress").length;

    const totalProjectInReview = projects.filter((p) => p.status === "Under Review").length;

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return taskDate > today && taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    for (const task of tasks) {
      const taskDate = new Date(task.updatedAt);
      const dayIndex = last7Days.findIndex(
        (date) =>
          date.getDate() === taskDate.getDate() &&
          date.getMonth() === taskDate.getMonth() &&
          date.getFullYear() === taskDate.getFullYear()
      );

      if (dayIndex !== -1) {
        const dayName = last7Days[dayIndex].toLocaleDateString("en-US", { weekday: "short" });
        const dayData = taskTrendsData.find((day) => day.name === dayName);
        if (dayData) {
          switch (task.status) {
            case "Done":
              dayData.completed++;
              break;
            case "In Progress":
              dayData.inProgress++;
              break;
            case "To Do":
              dayData.toDo++;
              break;
          }
        }
      }
    }

    const projectStatusData = [
      { name: "Filed", value: 0, color: "#6366f1" },
      { name: "Under Review", value: 0, color: "#3b82f6" },
      { name: "In Court", value: 0, color: "#8b5cf6" },
      { name: "Judgment Passed", value: 0, color: "#10b981" },
      { name: "Appealed", value: 0, color: "#f59e0b" },
      { name: "Closed", value: 0, color: "#64748b" },
      { name: "Withdrawn", value: 0, color: "#ef4444" },
    ];

    for (const project of projects) {
      const status = projectStatusData.find((s) => s.name === project.status);
      if (status) status.value++;
    }

    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      const priority = taskPriorityData.find((p) => p.name === task.priority);
      if (priority) priority.value++;
    }

    const workspaceProductivityData = projects.map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );
      const completed = projectTasks.filter((t) => t.status === "Done" && !t.isArchived).length;
      return {
        name: project.title,
        completed,
        total: projectTasks.length,
      };
    });

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInReview,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export { createWorkspace, getWorkspaces, getWorkspaceDetails, getWorkspaceProjects,updateWorkspace,deleteWorkspace,getWorkspaceStats };