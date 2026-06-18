import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";

async function inspect() {
    await connectDb();
    const admin = await User.findOne({ email: "admin@gmail.com" }).lean();
    console.log("Admin User in DB:", admin);
    await mongoose.disconnect();
}
inspect();
