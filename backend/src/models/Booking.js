import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", default: null }, // Legacy single package support
    pkgName: { type: String, default: "" }, // Legacy
    packages: [
      {
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
        name: String,
        category: String,
        price: Number,
        pricePerPlate: Number,
        selectedMenu: mongoose.Schema.Types.Mixed,
        selectedServices: [String]
      }
    ],
    guestCount: { type: Number, default: 0 },
    selectedMenu: { type: mongoose.Schema.Types.Mixed, default: {} }, // Legacy
    status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending" },
    eventDate: { type: String, default: "" },
    time: { type: String, default: "" },
    eventType: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" }
    },
    specialReq: { type: String, default: "" },
    pricePerPlate: { type: Number, default: 0 }, // Legacy
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    approvedAt: { type: String, default: "" },
    rejectedAt: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);

