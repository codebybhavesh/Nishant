import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { CustomMenuRequest } from "../models/CustomMenuRequest.js";

export const customMenuRequestsRouter = express.Router();

customMenuRequestsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = req.body ?? {};
    const created = await CustomMenuRequest.create({
      ...payload,
      userId: req.user._id,
      status: "pending"
    });
    res.status(201).json({ request: created });
  })
);

customMenuRequestsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const requests = await CustomMenuRequest.find({}).sort({ createdAt: -1 }).lean();
    res.json({ requests });
  })
);

customMenuRequestsRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await CustomMenuRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body ?? {} },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Request not found." });
    res.json({ request: updated });
  })
);

