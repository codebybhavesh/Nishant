import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = express.Router();

function signToken(userId) {
  if (!env.JWT_SECRET) throw new Error("Server JWT not configured.");
  return jwt.sign({}, env.JWT_SECRET, { subject: String(userId), expiresIn: env.JWT_EXPIRES_IN });
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, name = "", phone = "" } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
    if (String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = await User.findOne({ email: String(email).toLowerCase() }).lean();
    if (existing) return res.status(409).json({ error: "Email already registered." });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      email: String(email).toLowerCase(),
      passwordHash,
      name: String(name),
      phone: String(phone),
      role: "user"
    });

    const token = signToken(user._id);
    res.json({ token, user: { id: String(user._id), email: user.email, name: user.name, phone: user.phone, role: user.role } });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials." });

    const token = signToken(user._id);
    res.json({ token, user: { id: String(user._id), email: user.email, name: user.name, phone: user.phone, role: user.role } });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

authRouter.patch(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body ?? {};
    const updates = {};
    if (name !== undefined) updates.name = String(name);
    if (phone !== undefined) updates.phone = String(phone);
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select("-passwordHash")
      .lean();
    res.json({ user });
  })
);

