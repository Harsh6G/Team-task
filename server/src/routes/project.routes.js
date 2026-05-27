import express from "express";
import { body, param } from "express-validator";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const router = express.Router();

const projectPopulate = [
  { path: "owner", select: "name email role" },
  { path: "members", select: "name email role" }
];

function projectAccessQuery(user) {
  if (user.role === "admin") return {};
  return { members: user._id };
}

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find(projectAccessQuery(req.user))
      .populate(projectPopulate)
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireRole("admin"),
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Project name is required"),
    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description is too long"),
    body("members").optional().isArray().withMessage("Members must be an array")
  ],
  validate,
  async (req, res, next) => {
    try {
      const members = [...new Set([...(req.body.members || []), String(req.user._id)])];
      const validMembers = await User.find({ _id: { $in: members } }).select("_id");

      const project = await Project.create({
        name: req.body.name,
        description: req.body.description || "",
        owner: req.user._id,
        members: validMembers.map((user) => user._id)
      });

      res.status(201).json(await project.populate(projectPopulate));
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", [param("id").isMongoId().withMessage("Invalid project id")], validate, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ...projectAccessQuery(req.user) }).populate(projectPopulate);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id })
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1 });

    res.json({ project, tasks });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  requireRole("admin"),
  [
    param("id").isMongoId().withMessage("Invalid project id"),
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Project name is too short"),
    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description is too long"),
    body("members").optional().isArray().withMessage("Members must be an array")
  ],
  validate,
  async (req, res, next) => {
    try {
      const updates = {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.description !== undefined && { description: req.body.description })
      };

      if (req.body.members) {
        const memberIds = [...new Set([...req.body.members, String(req.user._id)])];
        const members = await User.find({ _id: { $in: memberIds } }).select("_id");
        updates.members = members.map((user) => user._id);
      }

      const project = await Project.findByIdAndUpdate(req.params.id, updates, { new: true }).populate(projectPopulate);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
