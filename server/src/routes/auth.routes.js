import express from "express";
import { body } from "express-validator";
import { createToken } from "../lib/tokens.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import User from "../models/User.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["admin", "member"]).withMessage("Invalid role")
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role = "member" } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email is already registered" });

      const user = await User.create({ name, email, password, role });
      res.status(201).json({
        token: createToken(user),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select("+password");
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.json({
        token: createToken(user),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

router.get("/users", protect, requireRole("admin"), async (req, res, next) => {
  try {
    const users = await User.find().select("name email role").sort({ name: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
