import mongoose from "mongoose";

const tierSchema = new mongoose.Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "veg", trim: true }, // veg/premium for catering
    category: { type: String, enum: ["catering", "event"], default: "catering" },
    pricePerPlate: { type: Number, default: 0 },
    price: { type: Number, default: 0 }, // base price for event packages
    minGuests: { type: Number, default: 0 },
    maxGuests: { type: Number, default: null }, // Added for symmetry
    imageURL: { type: String, default: "" },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    menu: { type: mongoose.Schema.Types.Mixed, default: {} },
    menuLimits: { type: mongoose.Schema.Types.Mixed, default: {} },
    services: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    tiers: { type: [tierSchema], default: [] }
  },
  { timestamps: true }
);

export const Package = mongoose.model("Package", packageSchema);

