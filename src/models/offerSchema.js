// models/offerSchema.js
import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        subtitle: {
            type: String,
            default: "",
            trim: true
        },
        badge: {
            type: String,
            default: "",
            trim: true
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        imageUrl: {
            type: String,
            trim: true,
            default: ""
        },
        cloudinaryPublicId: {
            type: String,
            trim: true,
            default: ""
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
