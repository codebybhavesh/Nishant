import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Gallery } from "../models/Gallery.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export const galleryRouter = express.Router();

// GET /api/gallery - Public: Fetch all gallery items sorted by uploadedAt desc
galleryRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await Gallery.find({}).sort({ uploadedAt: -1 }).lean();
    res.json({ items });
  })
);

// POST /api/gallery - Admin only: Add new gallery item
galleryRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, category, imageUrl, publicId } = req.body ?? {};
    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: "Title, category, and imageUrl are required." });
    }
    
    const validCategories = ["Wedding", "Corporate", "Birthday", "Catering", "Decoration"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
    }

    const created = await Gallery.create({
      title,
      category,
      imageUrl,
      publicId
    });
    res.status(201).json({ item: created });
  })
);

// PUT /api/gallery/:id - Admin only: Update existing gallery item
galleryRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, category, imageUrl, publicId } = req.body ?? {};
    
    if (category) {
      const validCategories = ["Wedding", "Corporate", "Birthday", "Catering", "Decoration"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
      }
    }

    const updated = await Gallery.findByIdAndUpdate(
      req.params.id,
      { title, category, imageUrl, publicId },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Gallery item not found." });
    }

    res.json({ item: updated });
  })
);

// DELETE /api/gallery/:id - Admin only: Delete gallery item
galleryRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await Gallery.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Gallery item not found." });
    }
    res.json({ success: true });
  })
);
