
import PackageModel from '../models/packageSchema.js';
import Category from '../models/categorySchema.js';




/* ----------------------------------
   CREATE OR UPDATE PACKAGE
-----------------------------------*/
export const createOrUpdatePackage = async (req, res) => {
    try {
        const {
            id,
            packageName,
            packageDetails,
            packageDuration,
            originalPrice,
            discountedPrice,
            servicesIncluded,
            category,
            summary
        } = req.body;

        /* ---------- Basic Validation ---------- */
        if (
            !packageName ||
            !packageDetails ||
            !packageDuration ||
            !originalPrice ||
            !discountedPrice ||
            !category
        ) {
            return res.status(400).json({
                ok: false,
                message: 'Missing required fields'
            });
        }

        if (Number(discountedPrice) > Number(originalPrice)) {
            return res.status(400).json({
                ok: false,
                message: 'discountedPrice cannot be greater than originalPrice'
            });
        }

        /* ---------- Category Validation (Optional but Safe) ---------- */
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid category'
            });
        }

        /* ---------- Services Validation ---------- */
        let normalizedServices = [];

        if (servicesIncluded) {
            if (!Array.isArray(servicesIncluded)) {
                return res.status(400).json({
                    ok: false,
                    message: 'servicesIncluded must be an array'
                });
            }

            normalizedServices = servicesIncluded.map((s, index) => {
                if (!s.serviceName) {
                    throw new Error(`Service name missing at index ${index}`);
                }

                return {
                    serviceName: s.serviceName.trim(),
                    price: s.price ?? undefined,
                    duration: s.duration ?? undefined
                };
            });
        }

        /* ---------- Payload ---------- */
        const payload = {
            packageName: packageName.trim(),
            packageDetails,
            packageDuration,
            originalPrice,
            discountedPrice,
            servicesIncluded: normalizedServices,
            category,
            summary: summary?.trim() || ''
        };

        /* ---------- CREATE / UPDATE ---------- */
        let pack;

        if (id) {
            pack = await PackageModel.findByIdAndUpdate(id, payload, {
                new: true
            });

            if (!pack) {
                return res.status(404).json({
                    ok: false,
                    message: 'Package not found'
                });
            }

            return res.json({
                ok: true,
                message: 'Package updated successfully',
                data: pack
            });
        }

        pack = await PackageModel.create(payload);

        return res.status(201).json({
            ok: true,
            message: 'Package created successfully',
            data: pack
        });

    } catch (err) {
        console.error('createOrUpdatePackage:', err.message);
        return res.status(500).json({
            ok: false,
            message: 'Server error',
            error: err.message
        });
    }
};



export const getPackages = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = '', category } = req.query;

        const query = {};

        if (search) {
            query.packageName = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [packages, total] = await Promise.all([
            PackageModel.find(query)
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 }),
            PackageModel.countDocuments(query)
        ]);

        res.status(200).json({
            ok: true,
            data: packages,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('getPackages:', err);
        res.status(500).json({
            ok: false,
            message: 'Server error'
        });
    }
};



export const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;

        const pack = await PackageModel.findById(id);
        if (!pack) {
            return res.status(404).json({
                ok: false,
                message: 'Package not found'
            });
        }

        res.json({ ok: true, data: pack });
    } catch (err) {
        console.error('getPackageById:', err);
        res.status(500).json({
            ok: false,
            message: 'Server error'
        });
    }
};


export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        const removed = await PackageModel.findByIdAndDelete(id);
        if (!removed) {
            return res.status(404).json({
                ok: false,
                message: 'Package not found'
            });
        }

        res.json({
            ok: true,
            message: 'Package deleted successfully'
        });
    } catch (err) {
        console.error('deletePackage:', err);
        res.status(500).json({
            ok: false,
            message: 'Server error'
        });
    }
};
