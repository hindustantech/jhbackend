// routes/packageRoutes.js
import express from 'express';
import {
    createOrUpdatePackage,
    getPackages,
    getPackageById,
    deletePackage
} from '../controllers/packageController.js';

const router = express.Router();

router.post('/', createOrUpdatePackage);
router.get('/', getPackages);
router.get('/:id', getPackageById);
router.delete('/:id', deletePackage);

export default router;
