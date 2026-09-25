import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';
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
router.post('/', protect, authorize("chatbot:manage"), createOrUpdateItem);
router.post('/upload', protect, authorize("chatbot:manage"), uploadSingleImage, handleUploadError, uploadChatbotImage);
router.post('/image/delete', protect, authorize("chatbot:manage"), deleteChatbotImage);
router.get('/', protect, authorize("chatbot:manage"), getChatbotItems);
router.delete('/:id', protect, authorize("chatbot:manage"), deleteChatbotItem);

export default router;