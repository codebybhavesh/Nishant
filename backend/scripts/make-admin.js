import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}

await connectDb();

const user = await User.findOneAndUpdate(
  { email: String(email).toLowerCase() },
  { role: "admin" },
  { new: true }
);

if (!user) {
  console.error("User not found:", email);
  await mongoose.disconnect();
  process.exit(1);
}

console.log("Updated user to admin:", { email: user.email, id: String(user._id) });
await mongoose.disconnect();

