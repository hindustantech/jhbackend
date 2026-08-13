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
        // Legacy single parent — kept as an alias of parentIds[0] for backward
        // compatibility with old clients and existing data.
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chatbot",
            default: null
        },
        // Graph support: a node can be linked under any number of parents
        // (one-to-one, one-to-many, many-to-one, many-to-many).
        // Empty array (or null) => root level question (level 1).
        parentIds: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Chatbot",
            default: []
        },
        active: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        },
        // Canvas flow builder position
        positionX: {
            type: Number,
            default: 0
        },
        positionY: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Keep parentId in sync with the first entry of parentIds
chatbotSchema.pre('save', function (next) {
    if (this.isModified('parentIds') || this.isModified('parentId')) {
        if (this.parentIds && this.parentIds.length > 0) {
            this.parentId = this.parentIds[0];
        } else if (this.parentId) {
            this.parentIds = [this.parentId];
        } else {
            this.parentId = null;
            this.parentIds = [];
        }
    }
    next();
});

export default mongoose.model("Chatbot", chatbotSchema);
