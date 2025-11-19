// models/Package.js
import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
    {
        packageName: {
            type: String,
            required: true,
            trim: true
        },

        packageDetails: {
            type: String,
            required: true
        },

        packageDuration: {
            type: Number, // total duration (mins)
            required: true
        },

        originalPrice: {
            type: Number,
            required: true
        },

        discountedPrice: {
            type: Number,
            required: true,
            validate: {
                validator: function (v) {
                    return v <= this.originalPrice;
                },
                message: "Discounted price cannot be higher than original price."
            }
        },

        servicesIncluded: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service"
            }
        ],

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        summary: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("PackageModel", packageSchema);
