// scripts/migrateChatbotParents.js
// One-time migration: copies legacy single `parentId` into the new `parentIds`
// array so the flow builder supports many-to-one / many-to-many links.
// Run: node src/scripts/migrateChatbotParents.js
import dotenv from "dotenv";
import Chatbot from "../models/chatbotSchema.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const run = async () => {
    await connectDB();

    // For every doc that has a parentId but no parentIds yet, seed parentIds.
    const result = await Chatbot.updateMany(
        { parentId: { $ne: null }, $or: [{ parentIds: { $exists: false } }, { parentIds: { $size: 0 } }] },
        [{ $set: { parentIds: { $cond: [{ $eq: ["$parentId", null] }, [], ["$parentId"]] } } }]
    );

    // Normalize docs that have neither (make root explicitly).
    const roots = await Chatbot.updateMany(
        { $or: [{ parentId: null }, { parentId: { $exists: false } }], parentIds: { $exists: false } },
        [{ $set: { parentIds: [] } }]
    );

    console.log("Parent migration completed:", JSON.stringify(result));
    console.log("Root normalization completed:", JSON.stringify(roots));
    process.exit(0);
};

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});