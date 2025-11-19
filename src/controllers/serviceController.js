// controllers/serviceController.js
import Service from '../models/serviceSchema.js';
import { parsePagination, buildSearchQuery } from '../utils/apiHelpers.js';

/**
 * Create or Update Service.
 * If req.body.id present -> update, else create.
 */
export const createOrUpdateService = async (req, res) => {
    try {
        const {
            id, // optional - if present => update
            serviceName,
            serviceDescription,
            whatIncluded,
            serviceDuration,
            subServices
        } = req.body;

        // Basic validation
        if (!serviceName || !serviceDescription || !serviceDuration) {
            return res.status(400).json({ ok: false, message: 'serviceName, serviceDescription and serviceDuration are required.' });
        }

        const payload = {
            serviceName: serviceName.trim(),
            serviceDescription,
            whatIncluded: Array.isArray(whatIncluded) ? whatIncluded : (whatIncluded ? [whatIncluded] : []),
            serviceDuration,
            subServices: Array.isArray(subServices) ? subServices : (subServices ? [subServices] : [])
        };

        let service;
        if (id) {
            service = await Service.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
            if (!service) return res.status(404).json({ ok: false, message: 'Service not found for update.' });
            return res.json({ ok: true, message: 'Service updated', data: service });
        } else {
            service = new Service(payload);
            await service.save();
            return res.status(201).json({ ok: true, message: 'Service created', data: service });
        }
    } catch (err) {
        console.error('createOrUpdateService error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const getServices = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const q = req.query.q || '';
        const sort = req.query.sort || '-createdAt';

        const search = buildSearchQuery(q, ['serviceName', 'serviceDescription', 'whatIncluded']);

        const [items, total] = await Promise.all([
            Service.find(search).sort(sort).skip(skip).limit(limit),
            Service.countDocuments(search)
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
        console.error('getServices error', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);
        if (!service) return res.status(404).json({ ok: false, message: 'Service not found' });
        return res.json({ ok: true, data: service });
    } catch (err) {
        console.error('getServiceById', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await Service.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ ok: false, message: 'Service not found' });
        return res.json({ ok: true, message: 'Service deleted' });
    } catch (err) {
        console.error('deleteService', err);
        return res.status(500).json({ ok: false, message: 'Server error', error: err.message });
    }
};
