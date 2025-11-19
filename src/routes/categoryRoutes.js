// routes/categoryRoutes.js
import express from 'express';
import {
    createOrUpdateCategory,
    getCategories,
    getCategoryById,
    deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', createOrUpdateCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.delete('/:id', deleteCategory);

export default router;
