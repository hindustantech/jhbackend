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
            match: [/^\+91[6-9]\d{9}$/, "Please provide a valid Indian phone number"]
        },
        empId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Emp",
            default: null
        },
        empName: {
            type: String,
            trim: true,
            default: ""
        },
        dob: {
            type: Date,
            default: null
        },
        anniversaryDate: {
            type: Date,
            default: null
        },
        categories: {
            overallExperience: { type: Number, min: 1, max: 5, default: null },
            hygieneCleanliness: { type: Number, min: 1, max: 5, default: null },
            ambience: { type: Number, min: 1, max: 5, default: null },
            staffBehavior: { type: Number, min: 1, max: 5, default: null },
            professionalism: { type: Number, min: 1, max: 5, default: null },
            waitingTime: { type: Number, min: 1, max: 5, default: null },
            pricingValue: { type: Number, min: 1, max: 5, default: null }
        },
        employeeCategories: {
            professionalism: { type: Number, min: 1, max: 5, default: null },
            behavior: { type: Number, min: 1, max: 5, default: null },
            skillExpertise: { type: Number, min: 1, max: 5, default: null },
            communication: { type: Number, min: 1, max: 5, default: null }
        },
        specialData: {
            type: Map,
            of: String,
            default: {}
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