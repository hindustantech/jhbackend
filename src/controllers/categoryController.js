// controllers/categoryController.js
import Category from '../models/categorySchema.js';
import { parsePagination, buildSearchQuery } from '../utils/apiHelpers.js';

export const createOrUpdateCategory = async (req, res) => {
    try {
        const { id, categoryName, categoryDescription, image } = req.body;

        if (!categoryName) {
            return res.status(400).json({ ok: false, message: 'categoryName is required' });
        }

        const payload = {
            categoryName: categoryName.trim(),
            categoryDescription: categoryDescription || '',
            image: image || null
        };

        let category;
        if (id) {
            category = await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
            if (!category) return res.status(404).json({ ok: false, message: 'Category not found' });
            return res.json({ ok: true, message: 'Category updated', data: category });
        } else {
            // ensure unique categoryName
            const exists = await Category.findOne({ categoryName: payload.categoryName });
            if (exists) return res.status(400).json({ ok: false, message: 'Category with this name already exists' });

            category = new Category(payload);
            await category.save();
            return res.status(201).json({ ok: true, message: 'Category created', data: category });
        }
    } catch (err) {
        console.error('createOrUpdateCategory', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const q = req.query.q || '';
        const sort = req.query.sort || '-createdAt';
        const search = buildSearchQuery(q, ['categoryName', 'categoryDescription']);

        const [items, total] = await Promise.all([
            Category.find(search).sort(sort).skip(skip).limit(limit),
            Category.countDocuments(search)
        ]);

        return res.json({
            ok: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit) || 0,
            data: items
        });
    } catch (err) {
        console.error('getCategories', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const cat = await Category.findById(id);
        if (!cat) return res.status(404).json({ ok: false, message: 'Category not found' });
        return res.json({ ok: true, data: cat });
    } catch (err) {
        console.error('getCategoryById', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await Category.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ ok: false, message: 'Category not found' });
        return res.json({ ok: true, message: 'Category deleted' });
    } catch (err) {
        console.error('deleteCategory', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};
