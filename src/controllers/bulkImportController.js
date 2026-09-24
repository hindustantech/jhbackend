import { uploadSpreadsheet } from "../middleware/spreadsheetUpload.js";
import { parseCSV, parseExcel, processImport } from "../services/bulkImportService.js";
import Bill from "../models/billSchema.js";
import { logger } from "../config/logger.js";

export const importBills = async (req, res, next) => {
    try {
        uploadSpreadsheet(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ ok: false, message: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ ok: false, message: "No file uploaded" });
            }

            try {
                const ext = req.file.originalname.split(".").pop().toLowerCase();
                let records;

                if (ext === "csv") {
                    records = parseCSV(req.file.buffer);
                } else if (["xlsx", "xls"].includes(ext)) {
                    records = parseExcel(req.file.buffer);
                } else {
                    return res.status(400).json({ ok: false, message: "Unsupported file format. Use CSV or Excel." });
                }

                const result = await processImport(records);
                res.json({ ok: true, data: result });
            } catch (serviceErr) {
                logger.error("Import processing error:", serviceErr);
                res.status(500).json({ ok: false, message: serviceErr.message || "Import failed" });
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllBills = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.serviceName) filter.serviceName = { $regex: req.query.serviceName, $options: "i" };
        if (req.query.search) {
            filter.$or = [
                { customerName: { $regex: req.query.search, $options: "i" } },
                { phoneNo: { $regex: req.query.search, $options: "i" } },
                { billId: { $regex: req.query.search, $options: "i" } }
            ];
        }
        if (req.query.startDate || req.query.endDate) {
            filter.billDate = {};
            if (req.query.startDate) filter.billDate.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filter.billDate.$lte = new Date(req.query.endDate);
        }

        const [bills, total] = await Promise.all([
            Bill.find(filter).sort({ billDate: -1 }).skip(skip).limit(limit),
            Bill.countDocuments(filter)
        ]);

        res.json({ ok: true, data: bills, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        next(error);
    }
};

export const getImportStats = async (req, res, next) => {
    try {
        const [stats] = await Bill.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalAmount: { $sum: "$amount" },
                    avgAmount: { $avg: "$amount" },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    paid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
                    overdue: { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } }
                }
            }
        ]);

        const topServices = await Bill.aggregate([
            { $group: { _id: "$serviceName", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            ok: true,
            data: {
                summary: stats || { total: 0, totalAmount: 0, avgAmount: 0, pending: 0, paid: 0, overdue: 0, cancelled: 0 },
                topServices
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBill = async (req, res, next) => {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id);
        if (!bill) return res.status(404).json({ ok: false, message: "Bill not found" });
        res.json({ ok: true, message: "Bill deleted" });
    } catch (error) {
        next(error);
    }
};

export const updateBillStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["pending", "paid", "overdue", "cancelled"].includes(status)) {
            return res.status(400).json({ ok: false, message: "Invalid status" });
        }
        const bill = await Bill.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!bill) return res.status(404).json({ ok: false, message: "Bill not found" });
        res.json({ ok: true, data: bill });
    } catch (error) {
        next(error);
    }
};

export const exportAllRanking = async (req, res, next) => {
    try {
        const { type } = req.params;

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const matchStage = { billDate: { $gte: twelveMonthsAgo } };

        let sortField = "visitCount";
        if (type === "avg-spent") sortField = "avgSpent";
        else if (type === "total-spent") sortField = "totalSpent";
        else if (type !== "visits") {
            return res.status(400).json({ ok: false, message: "Invalid type. Use: visits, avg-spent, total-spent" });
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: "$phoneNo",
                    customerName: { $first: "$customerName" },
                    phoneNo: { $first: "$phoneNo" },
                    visitCount: { $sum: 1 },
                    totalSpent: { $sum: "$amount" },
                    avgSpent: { $avg: "$amount" },
                    lastVisit: { $max: "$billDate" },
                    firstVisit: { $min: "$billDate" },
                    services: { $push: "$serviceName" }
                }
            },
            { $sort: { [sortField]: -1 } },
            {
                $project: {
                    _id: 0,
                    phoneNo: 1,
                    customerName: 1,
                    visitCount: 1,
                    totalSpent: { $round: ["$totalSpent", 2] },
                    avgSpent: { $round: ["$avgSpent", 2] },
                    lastVisit: 1,
                    firstVisit: 1,
                    uniqueServices: { $size: { $setUnion: "$services" } }
                }
            }
        ];

        const data = await Bill.aggregate(pipeline);

        res.json({
            ok: true,
            data,
            total: data.length
        });
    } catch (error) {
        next(error);
    }
};

export const getCustomerRanking = async (req, res, next) => {
    try {
        const { type } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const matchStage = { billDate: { $gte: twelveMonthsAgo } };

        let sortField = "visitCount";
        if (type === "avg-spent") sortField = "avgSpent";
        else if (type === "total-spent") sortField = "totalSpent";
        else if (type !== "visits") {
            return res.status(400).json({ ok: false, message: "Invalid type. Use: visits, avg-spent, total-spent" });
        }

        const aggregationPipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: "$phoneNo",
                    customerName: { $first: "$customerName" },
                    phoneNo: { $first: "$phoneNo" },
                    visitCount: { $sum: 1 },
                    totalSpent: { $sum: "$amount" },
                    avgSpent: { $avg: "$amount" },
                    lastVisit: { $max: "$billDate" },
                    firstVisit: { $min: "$billDate" },
                    services: { $push: "$serviceName" }
                }
            },
            { $sort: { [sortField]: -1 } },
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                phoneNo: 1,
                                customerName: 1,
                                visitCount: 1,
                                totalSpent: { $round: ["$totalSpent", 2] },
                                avgSpent: { $round: ["$avgSpent", 2] },
                                lastVisit: 1,
                                firstVisit: 1,
                                uniqueServices: { $size: { $setUnion: "$services" } }
                            }
                        }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        const [result] = await Bill.aggregate(aggregationPipeline);
        const data = result.data || [];
        const total = result.totalCount[0]?.count || 0;

        res.json({
            ok: true,
            data,
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

export const getCustomerInsights = async (req, res, next) => {
    try {
        const { phone } = req.params;
        if (!phone) return res.status(400).json({ ok: false, message: "Phone number is required" });

        const cleaned = phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");
        const phonePattern = cleaned.length === 10 ? `91${cleaned}` : cleaned;

        const bills = await Bill.find({
            phoneNo: { $regex: phonePattern, $options: "i" }
        }).sort({ billDate: -1 });

        if (bills.length === 0) {
            return res.json({
                ok: true,
                found: false,
                message: "No bills found for this phone number",
                data: null
            });
        }

        const visitCount = bills.length;
        const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
        const serviceMap = {};
        bills.forEach((b) => {
            if (!serviceMap[b.serviceName]) serviceMap[b.serviceName] = { count: 0, totalSpent: 0 };
            serviceMap[b.serviceName].count += 1;
            serviceMap[b.serviceName].totalSpent += b.amount;
        });

        const serviceList = Object.entries(serviceMap).map(([name, data]) => ({
            serviceName: name,
            visits: data.count,
            totalSpent: data.totalSpent
        })).sort((a, b) => b.visits - a.visits);

        const lastVisit = bills[0].billDate;
        const firstVisit = bills[bills.length - 1].billDate;
        const daysSinceLastVisit = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));
        const daysBetweenFirstAndLast = Math.floor((new Date(lastVisit).getTime() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24));

        let tag = "New";
        if (visitCount >= 10) tag = "VIP";
        else if (visitCount >= 3 && daysBetweenFirstAndLast <= 180) tag = "Regular";
        else if (visitCount >= 3) tag = "Regular";
        else if (daysSinceLastVisit > 90 && visitCount >= 2) tag = "Churned";
        else if (visitCount === 1) tag = "New";

        res.json({
            ok: true,
            found: true,
            data: {
                customerName: bills[0].customerName,
                phoneNo: bills[0].phoneNo,
                visitCount,
                totalAmount,
                serviceList,
                lastVisit,
                firstVisit,
                daysSinceLastVisit,
                tag
            }
        });
    } catch (error) {
        next(error);
    }
};