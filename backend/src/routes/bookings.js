import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Booking } from "../models/Booking.js";
import { Package } from "../models/Package.js";

export const bookingsRouter = express.Router();

bookingsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = req.body ?? {};
    const created = await Booking.create({
      ...payload,
      userId: req.user._id,
      status: "pending"
    });
    res.status(201).json({ booking: created });
  })
);

bookingsRouter.get(
  "/my",
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ bookings });
  })
);

bookingsRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    // Allow owner or admin
    if (
      String(booking.userId) !== String(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied." });
    }
    res.json({ booking });
  })
);

bookingsRouter.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    res.json({ bookings });
  })
);

bookingsRouter.post(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    // If package exists, compute totals similar to Firestore admin logic.
    let pricePerPlate = booking.pricePerPlate || 0;
    if (booking.packageId) {
      const pkg = await Package.findById(booking.packageId).lean();
      if (pkg) {
        const guests = booking.guestCount || 0;
        pricePerPlate = pkg.pricePerPlate || pkg.price || 0;
        if (Array.isArray(pkg.tiers) && pkg.tiers.length > 0) {
          const tier = pkg.tiers.find((t) => guests >= t.min && guests <= t.max);
          if (tier) pricePerPlate = tier.price;
        }
      }
    }

    const subtotal = pricePerPlate * (booking.guestCount || 0);
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + tax;

    booking.status = "approved";
    booking.pricePerPlate = pricePerPlate;
    booking.subtotal = subtotal;
    booking.tax = tax;
    booking.grandTotal = grandTotal;
    booking.approvedAt = new Date().toISOString();
    booking.rejectedAt = "";

    await booking.save();
    res.json({ booking });
  })
);

bookingsRouter.post(
  "/:id/reject",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });

    booking.status = "rejected";
    booking.rejectedAt = new Date().toISOString();
    booking.approvedAt = "";
    await booking.save();

    res.json({ booking });
  })
);

