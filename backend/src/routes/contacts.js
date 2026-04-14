import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Contact } from "../models/Contact.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const contactsRouter = express.Router();

contactsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, phone, email = "", message } = req.body ?? {};
    if (!name || !phone || !message) return res.status(400).json({ error: "name, phone, message are required." });

    const created = await Contact.create({
      name: String(name),
      phone: String(phone),
      email: String(email),
      message: String(message),
      status: "unread"
    });
    res.status(201).json({ contact: created });
  })
);

contactsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const contacts = await Contact.find({}).sort({ createdAt: -1 }).lean();
    res.json({ contacts });
  })
);

contactsRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: req.body ?? {} },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Contact not found." });
    res.json({ contact: updated });
  })
);

contactsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await Contact.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Contact not found." });
    res.json({ success: true });
  })
);

