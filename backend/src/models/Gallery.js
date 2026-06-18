import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Wedding", "Corporate", "Birthday", "Catering", "Decoration"]
    },
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Gallery = mongoose.model("Gallery", gallerySchema);
