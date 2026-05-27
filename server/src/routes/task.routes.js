import express from "express";
import { body, param } from "express-validator";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const router = express.Router();

router.use(protect);

function canAccessProject(user, project) {
  return user.role === "admin" || project.members.some((id) => String(id) === String(user._id));
}

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find(req.user.role === "admin" ? {} : { members: req.user._id }).select("_id");
    const query = { project: { $in: projects.map((project) => project._id) } };

    if (req.query.mine === "true") query.assignee = req.user._id;
    if (req.query.status) query.status = req.query.status;

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireRole("admin"),
  [
    body("title").trim().isLength({ min: 2 }).withMessage("Task title is required"),
    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description is too long"),
    body("project").isMongoId().withMessage("Valid project is required"),
    body("assignee").isMongoId().withMessage("Valid assignee is required"),
    body("status").optional().isIn(["todo", "in-progress", "done"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
    body("dueDate").isISO8601().withMessage("Valid due date is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.body.project);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (!project.members.some((id) => String(id) === req.body.assignee)) {
        return res.status(400).json({ message: "Assignee must be a member of the project" });
      }

      const task = await Task.create({
        title: req.body.title,
        description: req.body.description || "",
        project: req.body.project,
        assignee: req.body.assignee,
        status: req.body.status || "todo",
        priority: req.body.priority || "medium",
        dueDate: req.body.dueDate,
        createdBy: req.user._id
      });

      res.status(201).json(
        await task.populate([
          { path: "project", select: "name" },
          { path: "assignee", select: "name email role" },
          { path: "createdBy", select: "name email role" }
        ])
      );
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid task id"),
    body("title").optional().trim().isLength({ min: 2 }).withMessage("Task title is too short"),
    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description is too long"),
    body("assignee").optional().isMongoId().withMessage("Valid assignee is required"),
    body("status").optional().isIn(["todo", "in-progress", "done"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
    body("dueDate").optional().isISO8601().withMessage("Valid due date is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const project = await Project.findById(task.project);
      if (!project || !canAccessProject(req.user, project)) return res.status(404).json({ message: "Task not found" });

      const isAssignee = String(task.assignee) === String(req.user._id);
      if (req.user.role !== "admin") {
        if (!isAssignee) return res.status(403).json({ message: "Only assigned members can update this task" });
        task.status = req.body.status || task.status;
      } else {
        ["title", "description", "assignee", "status", "priority", "dueDate"].forEach((field) => {
          if (req.body[field] !== undefined) task[field] = req.body[field];
        });

        if (req.body.assignee && !project.members.some((id) => String(id) === req.body.assignee)) {
          return res.status(400).json({ message: "Assignee must be a member of the project" });
        }
      }

      await task.save();
      res.json(
        await task.populate([
          { path: "project", select: "name" },
          { path: "assignee", select: "name email role" },
          { path: "createdBy", select: "name email role" }
        ])
      );
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", requireRole("admin"), [param("id").isMongoId().withMessage("Invalid task id")], validate, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
