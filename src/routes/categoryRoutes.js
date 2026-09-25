import express from 'express';
import {
    createOrUpdateCategory,
    getCategories,
    getCategoryById,
    deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize("categories:manage"), createOrUpdateCategory);
router.get('/', protect, authorize("dashboard:view", "categories:manage"), getCategories);
router.get('/:id', protect, authorize("dashboard:view", "categories:manage"), getCategoryById);
router.delete('/:id', protect, authorize("categories:manage"), deleteCategory);

export default router;
