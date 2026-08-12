// models/chatbotSchema.js
import mongoose from "mongoose";

const chatbotSchema = new mongoose.Schema(
    {
        // Text shown on the option button in the client chat
        label: {
            type: String,
            required: true,
            trim: true
        },
        // Optional answer shown when the visitor reaches this node
        answer: {
            type: String,
            default: ""
        },
        // null => root level question (level 1)
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chatbot",
            default: null
        },
        active: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model("Chatbot", chatbotSchema);