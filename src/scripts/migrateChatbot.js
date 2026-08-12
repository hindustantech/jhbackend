// scripts/migrateChatbot.js
// Converts old flat Q&A documents (question/message/isQuickReply) to the new tree format
// (label/answer/parentId). Old items become root-level questions.
// Run: node src/scripts/migrateChatbot.js
import dotenv from "dotenv";
import Chatbot from "../models/chatbotSchema.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const run = async () => {
    await connectDB();

    const result = await Chatbot.updateMany(
        { label: { $exists: false } },
        [
            {
                $set: {
                    label: { $ifNull: ["$question", ""] },
                    answer: { $ifNull: ["$message", ""] },
                    parentId: null,
                    positionX: 0,
                    positionY: 0
                }
            },
            { $unset: ["question", "message", "isQuickReply"] }
        ]
    );

    console.log("Migration completed:", JSON.stringify(result));
    process.exit(0);
};

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});