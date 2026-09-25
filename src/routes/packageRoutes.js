import express from 'express';
import {
    createOrUpdatePackage,
    getPackages,
    getPackageById,
    deletePackage
} from '../controllers/packageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize("packages:manage"), createOrUpdatePackage);
router.get('/', protect, authorize("dashboard:view", "packages:manage"), getPackages);
router.get('/:id', protect, authorize("dashboard:view", "packages:manage"), getPackageById);
router.delete('/:id', protect, authorize("packages:manage"), deletePackage);

export default router;
