// controllers/offerController.js
import Offer from '../models/offerSchema.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

// Public - active offers shown in the client offer modal / booking page
export const getActiveOffers = async (req, res) => {
    try {
        const now = new Date();
        const filter = {
            isActive: true,
            $and: [
                { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
            ]
        };
        const items = await Offer.find(filter).sort('order createdAt');
        return res.json({ ok: true, data: items });
    } catch (err) {
        console.error('getActiveOffers error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

// Admin - all offers
export const getAllOffers = async (req, res) => {
    try {
        const items = await Offer.find().sort('order createdAt');
        return res.json({ ok: true, data: items });
    } catch (err) {
        console.error('getAllOffers error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const getOfferById = async (req, res) => {
    try {
        const item = await Offer.findById(req.params.id);
        if (!item) return res.status(404).json({ ok: false, message: 'Offer not found' });
        return res.json({ ok: true, data: item });
    } catch (err) {
        console.error('getOfferById error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const createOffer = async (req, res) => {
    try {
        const { title, subtitle, badge, discount, isActive, order, startDate, endDate } = req.body;

        if (!title || !String(title).trim()) {
            return res.status(400).json({ ok: false, message: 'title is required.' });
        }

        const payload = {
            title: String(title).trim(),
            subtitle: subtitle || '',
            badge: badge || '',
            discount: Number(discount) || 0,
            isActive: isActive !== undefined ? isActive === true || isActive === 'true' : true,
            order: Number(order) || 0,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null
        };

        if (req.file) {
            try {
                const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
                payload.imageUrl = cloudinaryResult.secure_url;
                payload.cloudinaryPublicId = cloudinaryResult.public_id;
            } catch (uploadError) {
                return res.status(500).json({ ok: false, message: 'Failed to upload image', error: uploadError.message });
            }
        }

        const item = new Offer(payload);
        await item.save();
        return res.status(201).json({ ok: true, message: 'Offer created', data: item });
    } catch (err) {
        console.error('createOffer error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Offer.findById(id);
        if (!item) return res.status(404).json({ ok: false, message: 'Offer not found' });

        const { title, subtitle, badge, discount, isActive, order, startDate, endDate } = req.body;

        if (title !== undefined) {
            if (!String(title).trim()) return res.status(400).json({ ok: false, message: 'title is required.' });
            item.title = String(title).trim();
        }
        if (subtitle !== undefined) item.subtitle = subtitle;
        if (badge !== undefined) item.badge = badge;
        if (discount !== undefined) item.discount = Number(discount) || 0;
        if (isActive !== undefined) item.isActive = isActive === true || isActive === 'true';
        if (order !== undefined) item.order = Number(order) || 0;
        if (startDate !== undefined) item.startDate = startDate ? new Date(startDate) : null;
        if (endDate !== undefined) item.endDate = endDate ? new Date(endDate) : null;

        if (req.file) {
            try {
                if (item.cloudinaryPublicId) {
                    await cloudinary.uploader.destroy(item.cloudinaryPublicId).catch(() => undefined);
                }
                const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
                item.imageUrl = cloudinaryResult.secure_url;
                item.cloudinaryPublicId = cloudinaryResult.public_id;
            } catch (uploadError) {
                return res.status(500).json({ ok: false, message: 'Failed to upload image', error: uploadError.message });
            }
        }

        await item.save();
        return res.json({ ok: true, message: 'Offer updated', data: item });
    } catch (err) {
        console.error('updateOffer error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const deleteOffer = async (req, res) => {
    try {
        const item = await Offer.findById(req.params.id);
        if (!item) return res.status(404).json({ ok: false, message: 'Offer not found' });

        if (item.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(item.cloudinaryPublicId).catch(() => undefined);
        }

        await item.deleteOne();
        return res.json({ ok: true, message: 'Offer deleted' });
    } catch (err) {
        console.error('deleteOffer error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const toggleOfferActive = async (req, res) => {
    try {
        const item = await Offer.findById(req.params.id);
        if (!item) return res.status(404).json({ ok: false, message: 'Offer not found' });

        item.isActive = !item.isActive;
        await item.save();
        return res.json({
            ok: true,
            message: `Offer ${item.isActive ? 'activated' : 'deactivated'}`,
            data: item
        });
    } catch (err) {
        console.error('toggleOfferActive error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};
