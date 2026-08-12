// routes/chatbotRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createOrUpdateItem,
    getChatbotItems,
    getRoots,
    getChildren,
    deleteChatbotItem
} from '../controllers/chatbotController.js';

const router = express.Router();

// Public - used by the client chatbot
router.get('/roots', getRoots);
router.get('/children/:parentId', getChildren);

// Admin protected routes
router.post('/', protect, createOrUpdateItem);
router.get('/', protect, getChatbotItems);
router.delete('/:id', protect, deleteChatbotItem);

export default router;