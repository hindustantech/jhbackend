// controllers/chatbotController.js
import mongoose from "mongoose";
import Chatbot from '../models/chatbotSchema.js';
import { parsePagination, buildSearchQuery } from '../utils/apiHelpers.js';

const normalizeParent = async (parentId) => {
    if (parentId === null || parentId === undefined || parentId === '') return null;
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw Object.assign(new Error('Invalid parent question id'), { statusCode: 400 });
    }
    const parent = await Chatbot.findById(parentId);
    if (!parent) {
        throw Object.assign(new Error('Parent question not found'), { statusCode: 400 });
    }
    return parentId;
};

// Walk up the ancestor chain of `startId` looking for `targetId`
const isAncestor = async (startId, targetId) => {
    let current = startId;
    while (current) {
        if (current === targetId) return true;
        const node = await Chatbot.findById(current).select('parentId');
        if (!node || !node.parentId) break;
        current = node.parentId.toString();
    }
    return false;
};

/**
 * Create or Update chatbot node.
 * If req.body.id present -> update (only provided fields are changed), else create.
 */
export const createOrUpdateItem = async (req, res) => {
    try {
        const { id, label, answer, active, order, parentId, positionX, positionY } = req.body;

        if (label !== undefined && !String(label).trim()) {
            return res.status(400).json({ ok: false, message: 'label is required.' });
        }

        const payload = {};
        if (label !== undefined) payload.label = String(label).trim();
        if (answer !== undefined) payload.answer = answer;
        if (active !== undefined) payload.active = !!active;
        if (order !== undefined) payload.order = Number(order) || 0;
        if (positionX !== undefined) payload.positionX = Number(positionX) || 0;
        if (positionY !== undefined) payload.positionY = Number(positionY) || 0;
        if (parentId !== undefined) {
            const normalized = await normalizeParent(parentId);
            // Cycle guard: prevent linking a node under its own descendant
            if (id && normalized && await isAncestor(normalized, id)) {
                return res.status(400).json({ ok: false, message: 'Cannot link a question under its own sub-question (cycle detected).' });
            }
            payload.parentId = normalized;
        }

        if (Object.keys(payload).length === 0) {
            return res.status(400).json({ ok: false, message: 'No fields to save.' });
        }

        let item;
        if (id) {
            item = await Chatbot.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
            if (!item) return res.status(404).json({ ok: false, message: 'Chatbot item not found for update.' });
            return res.json({ ok: true, message: 'Chatbot item updated', data: item });
        }

        if (payload.label === undefined) {
            return res.status(400).json({ ok: false, message: 'label is required.' });
        }

        item = new Chatbot({
            label: payload.label,
            answer: payload.answer ?? '',
            active: payload.active ?? true,
            order: payload.order ?? 0,
            parentId: payload.parentId ?? null,
            positionX: payload.positionX ?? 0,
            positionY: payload.positionY ?? 0
        });
        await item.save();
        return res.status(201).json({ ok: true, message: 'Chatbot item created', data: item });
    } catch (err) {
        console.error('createOrUpdateItem error', err);
        return res.status(err.statusCode || 500).json({ ok: false, message: err.statusCode ? err.message : 'Server error', error: err.statusCode ? undefined : err.message });
    }
};

export const getChatbotItems = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const q = req.query.q || '';
        const sort = req.query.sort || 'order';

        const search = buildSearchQuery(q, ['label', 'answer']);

        const [items, total] = await Promise.all([
            Chatbot.find(search).sort(sort).skip(skip).limit(limit),
            Chatbot.countDocuments(search)
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
        console.error('getChatbotItems error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

// Public - level 1 options shown in the client chat
export const getRoots = async (req, res) => {
    try {
        const items = await Chatbot.find({ active: true, parentId: null }).sort('order');
        return res.json({ ok: true, data: items });
    } catch (err) {
        console.error('getRoots error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

// Public - next level options for a selected node
export const getChildren = async (req, res) => {
    try {
        const { parentId } = req.params;
        const items = await Chatbot.find({ active: true, parentId }).sort('order');
        return res.json({ ok: true, data: items });
    } catch (err) {
        console.error('getChildren error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

// Collect all descendant ids (recursively) for cascade delete
const collectDescendantIds = async (ids) => {
    let all = [...ids];
    let frontier = ids;
    while (frontier.length > 0) {
        const children = await Chatbot.find({ parentId: { $in: frontier } }).select('_id');
        const childIds = children.map((c) => c._id.toString());
        if (childIds.length === 0) break;
        all = all.concat(childIds);
        frontier = childIds;
    }
    return all;
};

export const deleteChatbotItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Chatbot.findById(id);
        if (!item) return res.status(404).json({ ok: false, message: 'Chatbot item not found' });

        const ids = await collectDescendantIds([id]);
        await Chatbot.deleteMany({ _id: { $in: ids } });

        return res.json({ ok: true, message: `Chatbot item and ${ids.length - 1} sub-question(s) deleted` });
    } catch (err) {
        console.error('deleteChatbotItem error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};