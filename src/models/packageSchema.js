// models/Package.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        serviceName: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: false
        },

        duration: {
            type: Number, // minutes (optional)
            required: false
        }
    },
    { _id: false } // prevents auto ObjectId for each service
);

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
            type: Number, // total duration in minutes
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

        servicesIncluded: [serviceSchema],

        category: {
            type: String, // simplified for flexibility
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
