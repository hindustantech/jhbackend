import { Schema, model } from 'mongoose';

const gallerySchema = new Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true
        },
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        position: {
            type: String,
            enum: ['top', 'middle', 'bottom'],
            default: 'middle'
        },
        order: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

export default model('Gallery', gallerySchema);