import Review from "../models/reviewSchema.js";
import { sendWhatsAppTemplate } from "../services/whatsappService.js";
import { logger } from "../config/logger.js";

export const createReview = async (req, res, next) => {
    try {
        const { rating, reviewText, phone } = req.body;

        if (!rating || !phone) {
            return res.status(400).json({ ok: false, message: "Rating and phone are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ ok: false, message: "Rating must be between 1 and 5" });
        }

        const phoneRegex = /^\+?(91)?[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
            return res.status(400).json({ ok: false, message: "Please provide a valid Indian phone number" });
        }

        const cleanPhone = phone.replace(/\s/g, "");
        const normalizedPhone = cleanPhone.startsWith("+91") ? cleanPhone : cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`;

        const review = await Review.create({
            rating: parseInt(rating),
            reviewText: reviewText || "",
            phone: normalizedPhone,
            ipAddress: req.ip || req.connection?.remoteAddress || "",
            userAgent: req.headers["user-agent"] || ""
        });

        // Fire-and-forge: Send WhatsApp template after review submission (don't block response)
        // This will send the offer template to the user's phone
        sendWhatsAppTemplate(normalizedPhone, "Valued Customer", "15")
            .then((result) => {
                if (result.ok) {
                    logger.info(`WhatsApp offer sent to phone ${normalizedPhone} after review submission`);
                } else {
                    logger.warn(`WhatsApp offer failed for phone ${normalizedPhone}: ${result.message}`);
                }
            })
            .catch((err) => {
                logger.error(`Error sending WhatsApp offer after review:`, err);
            });

        res.status(201).json({
            ok: true,
            message: "Review submitted successfully! Thank you for rating us.",
            data: {
                _id: review._id,
                rating: review.rating,
                reviewText: review.reviewText,
                phone: review.phone,
                createdAt: review.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.rating) {
            filter.rating = parseInt(req.query.rating);
        }
        if (req.query.startDate) {
            filter.createdAt = { ...filter.createdAt, $gte: new Date(req.query.startDate) };
        }
        if (req.query.endDate) {
            filter.createdAt = { ...filter.createdAt, $lte: new Date(req.query.endDate) };
        }

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("-userAgent -ipAddress"),
            Review.countDocuments(filter)
        ]);

        res.json({
            ok: true,
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getReviewStats = async (req, res, next) => {
    try {
        const [stats] = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    star1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                    star2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                    star3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                    star4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                    star5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } }
                }
            }
        ]);

        const distribution = [
            { stars: 1, count: stats?.star1 || 0 },
            { stars: 2, count: stats?.star2 || 0 },
            { stars: 3, count: stats?.star3 || 0 },
            { stars: 4, count: stats?.star4 || 0 },
            { stars: 5, count: stats?.star5 || 0 }
        ];

        res.json({
            ok: true,
            data: {
                avgRating: stats?.avgRating ? Math.round(stats.avgRating * 10) / 10 : 0,
                totalReviews: stats?.totalReviews || 0,
                distribution
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ ok: false, message: "Review not found" });
        }
        res.json({ ok: true, message: "Review deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const sendWhatsApp = async (req, res, next) => {
    try {
        const { phone, customerName, discountPercent } = req.body;

        if (!phone) {
            return res.status(400).json({ ok: false, message: "Phone number is required" });
        }

        const result = await sendWhatsAppTemplate(
            phone,
            customerName || "Valued Customer",
            discountPercent || "15"
        );

        if (result.ok) {
            res.json({ ok: true, message: "WhatsApp template sent successfully", data: result.data });
        } else {
            res.status(500).json({ ok: false, message: result.message || "Failed to send WhatsApp template" });
        }
    } catch (error) {
        next(error);
    }
};
