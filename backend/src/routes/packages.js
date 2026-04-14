import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Package } from "../models/Package.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const packagesRouter = express.Router();

packagesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const packages = await Package.find({}).sort({ createdAt: -1 }).lean();
    res.json({ packages });
  })
);

packagesRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const created = await Package.create(req.body ?? {});
    res.status(201).json({ package: created });
  })
);

packagesRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await Package.findByIdAndUpdate(req.params.id, req.body ?? {}, { new: true });
    if (!updated) return res.status(404).json({ error: "Package not found." });
    res.json({ package: updated });
  })
);

packagesRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Package not found." });
    res.json({ success: true });
  })
);

