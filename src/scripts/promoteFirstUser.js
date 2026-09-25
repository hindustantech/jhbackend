import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const ALL_PERMISSIONS = [
    "dashboard:view",
    "categories:manage",
    "packages:manage",
    "services:manage",
    "gallery:manage",
    "offers:manage",
    "chatbot:manage",
    "reviews:manage",
    "bills:manage",
    "customers:manage",
    "ranking:view",
    "employees:manage"
];

const migrate = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error("MONGO_URI not found in .env");
            process.exit(1);
        }

        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        const User = mongoose.model("User", new mongoose.Schema({
            name: String,
            email: String,
            mobile: String,
            password: String,
            role: { type: String, default: "employee" },
            permissions: [{ type: String }],
            refreshToken: String,
            otp: String,
            otpExpires: Date
        }, { timestamps: true }));

        const userCount = await User.countDocuments({});
        console.log(`Total users found: ${userCount}`);

        if (userCount === 0) {
            console.log("No users found. Nothing to migrate.");
            await mongoose.disconnect();
            process.exit(0);
        }

        // Find the first user (oldest by createdAt)
        const firstUser = await User.findOne().sort({ createdAt: 1 });

        if (!firstUser) {
            console.log("No users found. Nothing to migrate.");
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log(`First user: ${firstUser.email} (current role: ${firstUser.role})`);

        if (firstUser.role === "super_admin") {
            console.log("User already has super_admin role. Skipping.");
            await mongoose.disconnect();
            process.exit(0);
        }

        // Promote to super_admin
        firstUser.role = "super_admin";
        firstUser.permissions = ALL_PERMISSIONS;
        await firstUser.save();

        console.log(`SUCCESS: Promoted ${firstUser.email} to super_admin`);
        console.log(`Assigned ${ALL_PERMISSIONS.length} permissions`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

migrate();
