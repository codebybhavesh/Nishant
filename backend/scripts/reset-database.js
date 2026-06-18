import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { Booking } from "../src/models/Booking.js";
import { Contact } from "../src/models/Contact.js";
import { Feedback } from "../src/models/Feedback.js";
import { MenuItem } from "../src/models/MenuItem.js";
import { Package } from "../src/models/Package.js";
import { Gallery } from "../src/models/Gallery.js";
import { User } from "../src/models/User.js";

async function resetDatabase() {
  try {
    await connectDb();
    console.log("Connected to MongoDB for database reset...");

    // 1. Clear operational transaction collections
    const bookingRes = await Booking.deleteMany({});
    console.log(`- Cleared bookings: deleted ${bookingRes.deletedCount} items.`);

    const contactRes = await Contact.deleteMany({});
    console.log(`- Cleared contacts: deleted ${contactRes.deletedCount} items.`);

    const feedbackRes = await Feedback.deleteMany({});
    console.log(`- Cleared feedback: deleted ${feedbackRes.deletedCount} items.`);

    const galleryRes = await Gallery.deleteMany({});
    console.log(`- Cleared gallery: deleted ${galleryRes.deletedCount} items.`);

    const menuRes = await MenuItem.deleteMany({});
    console.log(`- Cleared menus: deleted ${menuRes.deletedCount} items.`);

    const packageRes = await Package.deleteMany({});
    console.log(`- Cleared packages: deleted ${packageRes.deletedCount} items.`);

    // 2. Clear non-admin users, keeping only admin@gmail.com
    const userRes = await User.deleteMany({ email: { $ne: "admin@gmail.com" } });
    console.log(`- Cleared non-admin users: deleted ${userRes.deletedCount} users.`);

    // Ensure the primary admin account exists
    const adminUser = await User.findOne({ email: "admin@gmail.com" });
    if (adminUser) {
      console.log(`- Verified admin user: ${adminUser.email} exists with role: ${adminUser.role}`);
    } else {
      console.log("WARNING: No user found with email admin@gmail.com. Please register/create an admin user.");
    }

    console.log("\nDatabase reset successfully completed. Ready for delivery!");
  } catch (error) {
    console.error("Database reset failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

resetDatabase();
