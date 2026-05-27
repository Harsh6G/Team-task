import express from "express";
import { protect } from "../middleware/auth.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const projects = await Project.find(req.user.role === "admin" ? {} : { members: req.user._id }).select("_id");
    const projectIds = projects.map((project) => project._id);
    const taskQuery = { project: { $in: projectIds } };
    const now = new Date();

    const [totalTasks, todo, inProgress, done, overdue, mine, recent] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: "todo" }),
      Task.countDocuments({ ...taskQuery, status: "in-progress" }),
      Task.countDocuments({ ...taskQuery, status: "done" }),
      Task.countDocuments({ ...taskQuery, status: { $ne: "done" }, dueDate: { $lt: now } }),
      Task.countDocuments({ ...taskQuery, assignee: req.user._id, status: { $ne: "done" } }),
      Task.find(taskQuery)
        .populate("project", "name")
        .populate("assignee", "name email role")
        .sort({ dueDate: 1 })
        .limit(8)
    ]);

    res.json({
      projects: projectIds.length,
      totalTasks,
      status: { todo, inProgress, done },
      overdue,
      assignedToMe: mine,
      recent
    });
  } catch (error) {
    next(error);
  }
});

export default router;
