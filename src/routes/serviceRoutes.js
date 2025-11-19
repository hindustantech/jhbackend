// routes/serviceRoutes.js
import express from 'express';
import {
    createOrUpdateService,
    getServices,
    getServiceById,
    deleteService
} from '../controllers/serviceController.js';


const router = express.Router();

// Create or Update (POST) - if req.body.id present update else create
router.post('/', createOrUpdateService);

// Get list with pagination & search
router.get('/', getServices);

// Get one
router.get('/:id', getServiceById);

// Delete
router.delete('/:id', deleteService);

export default router;
