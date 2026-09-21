import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
    {
        billId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        phoneNo: {
            type: String,
            required: true,
            trim: true
        },
        serviceName: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        billDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["pending", "paid", "overdue", "cancelled"],
            default: "pending"
        }
    },
    { timestamps: true }
);

billSchema.index({ customerName: "text", phoneNo: "text" });
billSchema.index({ billDate: -1 });
billSchema.index({ serviceName: 1 });

export default mongoose.model("Bill", billSchema);
