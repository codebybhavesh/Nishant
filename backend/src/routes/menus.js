import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MenuItem } from "../models/MenuItem.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const menusRouter = express.Router();

menusRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const menus = await MenuItem.find({}).sort({ createdAt: -1 }).lean();
    res.json({ menus });
  })
);

menusRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const created = await MenuItem.create(req.body ?? {});
    res.status(201).json({ menu: created });
  })
);

menusRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body ?? {}, { new: true });
    if (!updated) return res.status(404).json({ error: "Menu item not found." });
    res.json({ menu: updated });
  })
);

menusRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Menu item not found." });
    res.json({ success: true });
  })
);

