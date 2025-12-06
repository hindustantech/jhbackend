import { Schema, model } from 'mongoose';

const gallerySchema = new Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true
        },
        optimizedUrl: {
            type: String,
            trim: true
        },
        thumbnailUrl: {
            type: String,
            trim: true
        },
        cloudinaryPublicId: {
            type: String,
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
        imageInfo: {
            format: String,
            width: Number,
            height: Number,
            size: Number,
            originalFilename: String,
            mimeType: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for getting different image sizes
gallerySchema.virtual('imageUrls').get(function () {
    if (!this.cloudinaryPublicId) return {};

    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    return {
        original: this.url,
        hd: `${baseUrl}/c_limit,w_1920,q_auto:best/${this.cloudinaryPublicId}`,
        large: `${baseUrl}/c_limit,w_1280,q_auto:good/${this.cloudinaryPublicId}`,
        medium: `${baseUrl}/c_limit,w_800,q_auto:good/${this.cloudinaryPublicId}`,
        small: `${baseUrl}/c_limit,w_400,q_auto:good/${this.cloudinaryPublicId}`,
        thumbnail: `${baseUrl}/c_fill,w_300,h_200,q_auto:good/${this.cloudinaryPublicId}`
    };
});

export default model('Gallery', gallerySchema);