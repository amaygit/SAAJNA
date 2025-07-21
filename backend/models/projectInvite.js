// models/projectInvite.js
import mongoose from "mongoose";

const projectInviteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["manager", "contributor", "viewer"],
      default: "contributor",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProjectInvite", projectInviteSchema);
