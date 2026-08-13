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

const normalizeParents = async (parentIds) => {
    if (!Array.isArray(parentIds)) return [];
    const unique = [...new Set(parentIds)];
    const normalized = [];
    for (const pid of unique) {
        const n = await normalizeParent(pid);
        if (n) normalized.push(n);
    }
    return normalized;
};

// Graph-safe cycle check: starting from `startId`, walk BOTH directions
// (children and parents). If we ever reach `targetId`, a cycle would be created.
const canReach = async (startId, targetId, seen = new Set()) => {
    if (seen.has(startId)) return false;
    seen.add(startId);
    if (startId === targetId) return true;

    const node = await Chatbot.findById(startId).select('parentId parentIds');
    if (!node) return false;

    const frontier = [];
    for (const pid of node.parentIds || []) frontier.push(pid.toString());
    if (node.parentId && !(node.parentIds || []).some((p) => p && p.toString() === node.parentId.toString())) {
        frontier.push(node.parentId.toString());
    }

    for (const next of frontier) {
        if (await canReach(next, targetId, seen)) return true;
    }
    return false;
};

/**
 * Create or Update chatbot node.
 * If req.body.id present -> update (only provided fields are changed), else create.
 * Supports a single legacy `parentId` and/or a `parentIds` array (graph links).
 */
export const createOrUpdateItem = async (req, res) => {
    try {
        const { id, label, answer, active, order, parentId, parentIds, positionX, positionY } = req.body;

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

        if (parentIds !== undefined || parentId !== undefined) {
            let normalized;
            if (parentIds !== undefined) {
                normalized = await normalizeParents(parentIds);
            } else {
                // Legacy single-parent update — replace the whole link set with
                // the previous parents + the new single parent (add/remove).
                const existing = id ? await Chatbot.findById(id).select('parentIds') : null;
                const prev = (existing?.parentIds || []).map((p) => p.toString());
                const single = await normalizeParent(parentId);
                if (single) {
                    normalized = [...prev.filter((p) => p !== single), single];
                } else {
                    normalized = [];
                }
            }

            // Cycle guard: reject links that would let the new parents reach this node
            // through children (parent is a descendant) or through parents (graph cycle).
            if (id && normalized.length > 0) {
                for (const nid of normalized) {
                    if (nid === id) {
                        return res.status(400).json({ ok: false, message: 'Cannot link a question to itself.' });
                    }
                    if (await canReach(nid, id)) {
                        return res.status(400).json({ ok: false, message: 'Cannot link a question under its own sub-question (cycle detected).' });
                    }
                }
            }

            payload.parentIds = normalized;
            payload.parentId = normalized.length > 0 ? normalized[0] : null;
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
            parentIds: payload.parentIds ?? [],
            parentId: (payload.parentIds ?? [])[0] ?? null,
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
        const items = await Chatbot.find({
            active: true,
            $or: [
                { parentIds: { $size: 0 } },
                { parentIds: { $exists: false } },
                { parentId: null }
            ]
        }).sort('order');
        return res.json({ ok: true, data: items });
    } catch (err) {
        console.error('getRoots error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

// Public - next level options for a selected node (a node can live under
// many parents, so we match against parentIds and the legacy parentId).
export const getChildren = async (req, res) => {
    try {
        const { parentId } = req.params;
        const items = await Chatbot.find({
            active: true,
            $or: [{ parentIds: parentId }, { parentId }]
        }).sort('order');
        return res.json({ ok: true, data: items });
    } catch (err) {
        console.error('getChildren error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

// Collect every descendant id (BFS over the graph's parentIds links).
// Only cascades into children that have no remaining parents outside the
// deleted set, so multi-parent nodes survive the deletion of one parent.
const collectDescendantIds = async (ids) => {
    const doomed = new Set(ids);
    let frontier = ids;
    while (frontier.length > 0) {
        const children = await Chatbot.find({ parentIds: { $in: frontier } }).select('parentIds');
        const next = [];
        for (const child of children) {
            const childId = child._id.toString();
            if (doomed.has(childId)) continue;
            const remainingParents = (child.parentIds || [])
                .map((p) => p.toString())
                .filter((p) => !doomed.has(p));
            // Only cascade when this node has no parents left outside the deleted set
            if (remainingParents.length === 0) {
                doomed.add(childId);
                next.push(childId);
            }
        }
        frontier = next;
    }
    return [...doomed];
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
