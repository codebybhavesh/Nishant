import { createApp } from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;
const app = createApp();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

