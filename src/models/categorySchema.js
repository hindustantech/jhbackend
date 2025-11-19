// models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        categoryDescription: {
            type: String,
            trim: true
        },

        image: {
            type: String, // Cloudinary URL if you want
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
