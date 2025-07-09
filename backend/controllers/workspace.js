import Workspace from "../models/workspace.js"; 


const createWorkspace = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const workspace = await Workspace.create({
            name,
            description, 
            color,
            owner:req.user._id,
            members:[
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
            "members.user":req.user._id,
        }).sort({createdAt:-1});
        res.status(200).json(workspaces)
    } catch (error) {
        console.log(error);
        res.status(500)({
            message: "Internal Server Error"
        })
    }
}

export { createWorkspace,getWorkspaces };