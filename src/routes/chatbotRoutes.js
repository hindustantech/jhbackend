// routes/chatbotRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingleImage, handleUploadError } from '../middleware/upload.js';
import {
    createOrUpdateItem,
    getChatbotItems,
    getRoots,
    getChildren,
    deleteChatbotItem,
    uploadChatbotImage,
    deleteChatbotImage
} from '../controllers/chatbotController.js';

const router = express.Router();

// Public - used by the client chatbot
router.get('/roots', getRoots);
router.get('/children/:parentId', getChildren);

// Admin protected routes
router.post('/', protect, createOrUpdateItem);
router.post('/upload', protect, uploadSingleImage, handleUploadError, uploadChatbotImage);
router.post('/image/delete', protect, deleteChatbotImage);
router.get('/', protect, getChatbotItems);
router.delete('/:id', protect, deleteChatbotItem);

export default router;