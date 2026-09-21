import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        reviewText: {
            type: String,
            trim: true,
            default: "",
            maxlength: 1000
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^\+?91?[6-9]\d{9}$/, "Please provide a valid Indian phone number"]
        },
        ipAddress: {
            type: String,
            default: ""
        },
        userAgent: {
            type: String,
            default: ""
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
