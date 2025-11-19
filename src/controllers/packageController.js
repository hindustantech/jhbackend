
import PackageModel from '../models/packageSchema.js';
import Service from '../models/serviceSchema.js';
import Category from '../models/categorySchema.js';
import { parsePagination, buildSearchQuery } from '../utils/apiHelpers.js';

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

        if (!packageName || !packageDetails || !packageDuration || !originalPrice || !discountedPrice || !category) {
            return res.status(400).json({ ok: false, message: 'Missing required fields' });
        }

        if (Number(discountedPrice) > Number(originalPrice)) {
            return res.status(400).json({ ok: false, message: 'discountedPrice cannot be greater than originalPrice' });
        }

        const catExists = await Category.findById(category);
        if (!catExists) return res.status(400).json({ ok: false, message: 'Invalid category id' });

        let servicesArray = [];
        if (servicesIncluded) {
            if (!Array.isArray(servicesIncluded)) {
                return res.status(400).json({ ok: false, message: 'servicesIncluded must be an array' });
            }

            const foundServices = await Service.find({ _id: { $in: servicesIncluded } });
            if (foundServices.length !== servicesIncluded.length) {
                return res.status(400).json({ ok: false, message: 'Invalid service ID(s)' });
            }
            servicesArray = servicesIncluded;
        }

        const payload = {
            packageName: packageName.trim(),
            packageDetails,
            packageDuration,
            originalPrice,
            discountedPrice,
            servicesIncluded: servicesArray,
            category,
            summary: summary || ''
        };

        let pack;
        if (id) {
            // UPDATE
            await PackageModel.findByIdAndUpdate(id, payload);

            pack = await PackageModel.findById(id)
                .populate('servicesIncluded')
                .populate('category');

            if (!pack) return res.status(404).json({ ok: false, message: 'Package not found' });

            return res.json({ ok: true, message: 'Package updated', data: pack });

        } else {
            // CREATE
            pack = await new PackageModel(payload).save();

            pack = await PackageModel.findById(pack._id)
                .populate('servicesIncluded')
                .populate('category');

            return res.status(201).json({ ok: true, message: 'Package created', data: pack });
        }

    } catch (err) {
        console.error('createOrUpdatePackage', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};


export const getPackages = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = "", category } = req.query;

        const query = {};

        if (search) {
            query.packageName = { $regex: search, $options: "i" };
        }

        if (category) {
            query.packageCategory = category;
        }

        const packages = await PackageModel.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await PackageModel.countDocuments(query);

        res.status(200).json({
            message: "Packages fetched",
            data: packages,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const pack = await PackageModel.findById(id).populate('servicesIncluded').populate('category');
        if (!pack) return res.status(404).json({ ok: false, message: 'Package not found' });
        return res.json({ ok: true, data: pack });
    } catch (err) {
        console.error('getPackageById', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await PackageModel.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ ok: false, message: 'Package not found' });
        return res.json({ ok: true, message: 'Package deleted' });
    } catch (err) {
        console.error('deletePackage', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};
