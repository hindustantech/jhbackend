import Review from "../models/reviewSchema.js";
import Emp from "../models/empSchema.js";
import { sendWhatsAppTemplate } from "../services/whatsappService.js";
import { logger } from "../config/logger.js";

const normalizePhone = (phone) => {
    const clean = phone.replace(/\s/g, "");
    if (clean.startsWith("+91")) return clean;
    if (clean.startsWith("91")) return `+${clean}`;
    return `+91${clean}`;
};

const isValidRating = (val) => {
    const n = Number(val);
    return Number.isInteger(n) && n >= 1 && n <= 5;
};



export const createReview = async (req, res, next) => {
    try {
        const {
            rating, reviewText, phone,
            empName, dob, anniversaryDate,
            categories, employeeCategories,
            employees: employeesBody,
            specialData
        } = req.body;

        if (!rating || !phone) {
            return res.status(400).json({ ok: false, message: "Rating and phone are required" });
        }

        if (!isValidRating(rating)) {
            return res.status(400).json({ ok: false, message: "Rating must be between 1 and 5" });
        }

        const phoneRegex = /^\+?(91)?[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/\s/g, "");
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({ ok: false, message: "Please provide a valid Indian phone number" });
        }

        const normalizedPhone = cleanPhone.startsWith("+91") ? cleanPhone
            : cleanPhone.startsWith("91") ? `+${cleanPhone}`
            : `+91${cleanPhone}`;

        if (dob && isNaN(Date.parse(dob))) {
            return res.status(400).json({ ok: false, message: "Invalid date of birth" });
        }
        if (anniversaryDate && isNaN(Date.parse(anniversaryDate))) {
            return res.status(400).json({ ok: false, message: "Invalid anniversary date" });
        }

        let empId = null;
        if (empName) {
            const emp = await Emp.findOne({ name: { $regex: new RegExp(`^${empName}$`, "i") } });
            if (emp) {
                empId = emp._id;
            }
        }

        const validatedCategories = {};
        if (categories) {
            for (const [key, val] of Object.entries(categories)) {
                if (val !== null && val !== undefined) {
                    if (!isValidRating(val)) {
                        return res.status(400).json({ ok: false, message: `Category "${key}" must be between 1 and 5` });
                    }
                    validatedCategories[key] = Number(val);
                }
            }
        }

        const validatedEmpCategories = {};
        if (employeeCategories) {
            for (const [key, val] of Object.entries(employeeCategories)) {
                if (val !== null && val !== undefined) {
                    if (!isValidRating(val)) {
                        return res.status(400).json({ ok: false, message: `Employee category "${key}" must be between 1 and 5` });
                    }
                    validatedEmpCategories[key] = Number(val);
                }
            }
        }

        const validatedEmployees = [];
        if (Array.isArray(employeesBody) && employeesBody.length > 0) {
            for (const empEntry of employeesBody) {
                const empNameStr = empEntry.empName || "";
                let empIdVal = null;
                if (empNameStr) {
                    const emp = await Emp.findOne({ name: { $regex: new RegExp(`^${empNameStr}$`, "i") } });
                    if (emp) {
                        empIdVal = emp._id;
                    }
                }

                validatedEmployees.push({
                    empId: empIdVal,
                    empName: empNameStr
                });
            }
        }

        const review = await Review.create({
            rating: parseInt(rating),
            reviewText: reviewText || "",
            phone: normalizedPhone,
            empId: empId || (validatedEmployees.length === 1 ? validatedEmployees[0].empId : null),
            empName: empName || (validatedEmployees.length === 1 ? validatedEmployees[0].empName : ""),
            employees: validatedEmployees.length > 0 ? validatedEmployees : undefined,
            dob: dob || null,
            anniversaryDate: anniversaryDate || null,
            categories: validatedCategories,
            employeeCategories: validatedEmpCategories,
            specialData: specialData || {},
            ipAddress: req.ip || req.connection?.remoteAddress || "",
            userAgent: req.headers["user-agent"] || ""
        });

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
                empName: review.empName,
                empId: review.empId,
                employees: review.employees,
                categories: review.categories,
                employeeCategories: review.employeeCategories,
                dob: review.dob,
                anniversaryDate: review.anniversaryDate,
                specialData: review.specialData,
                createdAt: review.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomerReviews = async (req, res, next) => {
    try {
        const { phone } = req.params;
        if (!phone) {
            return res.status(400).json({ ok: false, message: "Phone number is required" });
        }

        const normalizedPhone = normalizePhone(phone);

        const reviews = await Review.find({ phone: normalizedPhone, active: true })
            .sort({ createdAt: -1 })
            .populate("empId", "name phone role specialization")
            .populate("employees.empId", "name phone role specialization");

        if (!reviews.length) {
            return res.status(404).json({ ok: false, message: "No reviews found for this phone number" });
        }

        const totalReviews = reviews.length;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

        res.json({
            ok: true,
            data: {
                phone: normalizedPhone,
                totalReviews,
                avgRating: Math.round(avgRating * 10) / 10,
                reviews
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getEmployeeReviews = async (req, res, next) => {
    try {
        const { empId } = req.params;
        if (!empId) {
            return res.status(400).json({ ok: false, message: "Employee ID is required" });
        }

        const emp = await Emp.findById(empId);
        if (!emp) {
            return res.status(404).json({ ok: false, message: "Employee not found" });
        }

        const reviews = await Review.find({
            $or: [
                { empId, active: true },
                { "employees.empId": empId, active: true }
            ]
        })
            .sort({ createdAt: -1 })
            .select("-userAgent -ipAddress")
            .populate("employees.empId", "name phone role specialization");

        if (!reviews.length) {
            return res.status(404).json({ ok: false, message: "No reviews found for this employee" });
        }

        const totalReviews = reviews.length;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

        const empCatTotals = { professionalism: 0, behavior: 0, skillExpertise: 0, communication: 0 };
        let empCatCount = 0;

        reviews.forEach((r) => {
            const cats = r.employeeCategories;
            if (cats) {
                for (const key of Object.keys(empCatTotals)) {
                    if (cats[key]) {
                        empCatTotals[key] += cats[key];
                    }
                }
                empCatCount++;
            }
        });

        const empCatAvg = {};
        for (const [key, val] of Object.entries(empCatTotals)) {
            empCatAvg[key] = empCatCount > 0 ? Math.round((val / empCatCount) * 10) / 10 : 0;
        }

        res.json({
            ok: true,
            data: {
                employee: { _id: emp._id, name: emp.name, phone: emp.phone, role: emp.role },
                totalReviews,
                avgRating: Math.round(avgRating * 10) / 10,
                employeeCategoryAverages: empCatAvg,
                reviews
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
        if (req.query.active !== undefined) {
            filter.active = req.query.active === "true";
        }

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("empId", "name phone role")
                .populate("employees.empId", "name phone role")
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

export const getActiveReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ active: true })
            .sort({ createdAt: -1 })
            .select("-userAgent -ipAddress")
            .populate("empId", "name role specialization")
            .populate("employees.empId", "name role specialization")
            .limit(20);

        res.json({
            ok: true,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

export const getReviewById = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate("empId", "name phone role specialization")
            .populate("employees.empId", "name phone role specialization");

        if (!review) {
            return res.status(404).json({ ok: false, message: "Review not found" });
        }

        res.json({ ok: true, data: review });
    } catch (error) {
        next(error);
    }
};

export const toggleReviewActive = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ ok: false, message: "Review not found" });
        }
        review.active = !review.active;
        await review.save();
        res.json({ ok: true, data: { active: review.active } });
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