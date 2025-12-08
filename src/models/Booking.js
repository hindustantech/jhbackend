import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },

        whatsapp: {
            type: String,
            trim: true,
            required: true
        },

        email: {
            type: String,
            trim: true,
            required: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        },

        service: {
            type: String,
            trim: true,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        message: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
