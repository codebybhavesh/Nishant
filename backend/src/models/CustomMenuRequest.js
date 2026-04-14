import mongoose from "mongoose";

const customMenuRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    eventDate: { type: String, default: "" },
    guestCount: { type: Number, default: 0 },
    selectedMenuItems: {
      type: [
        {
          id: { type: String, default: "" },
          name: { type: String, default: "" },
          category: { type: String, default: "" }
        }
      ],
      default: []
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" }
    },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedAt: { type: String, default: "" },
    rejectedAt: { type: String, default: "" }
  },
  { timestamps: true }
);

export const CustomMenuRequest = mongoose.model("CustomMenuRequest", customMenuRequestSchema);

