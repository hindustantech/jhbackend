import express from 'express';
import {
    createOrUpdateService,
    getServices,
    getServiceById,
    deleteService
} from '../controllers/serviceController.js';
import { uploadSingleImage, handleUploadError } from '../middleware/upload.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';


const router = express.Router();

// Create or Update (POST) - if req.body.id present update else create
router.post('/', protect, authorize("services:manage"), uploadSingleImage, handleUploadError, createOrUpdateService);

// Get list with pagination & search
router.get('/', protect, authorize("dashboard:view", "services:manage"));

// Get one
router.get('/:id', protect, authorize("dashboard:view", "services:manage"));

// Delete
router.delete('/:id', protect, authorize("services:manage"));

export default router;