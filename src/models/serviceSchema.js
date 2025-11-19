// models/Service.js
import mongoose from "mongoose";

const subServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number, // in mins
        required: true
    }
});

const serviceSchema = new mongoose.Schema(
    {
        serviceName: {
            type: String,
            required: true,
            trim: true
        },

        serviceDescription: {
            type: String,
            required: true
        },

        whatIncluded: [
            {
                type: String,
                trim: true
            }
        ],

        serviceDuration: {
            type: Number,
            required: true
        },

        subServices: [subServiceSchema]
    },
    { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
