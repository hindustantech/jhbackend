import express from 'express';
import {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryActive,
  updateMultipleOrders,
  getGalleryByPosition
} from '../controllers/galleryController.js';
import { uploadSingleImage, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllGalleryItems);
router.get('/position/:position', getGalleryByPosition);
router.get('/:id', getGalleryItemById);

// Protected routes (add auth middleware if needed)
router.post(
  '/',
  uploadSingleImage,
  handleUploadError,
  createGalleryItem
);

router.put(
  '/:id',
  uploadSingleImage,
  handleUploadError,
  updateGalleryItem
);

router.put('/orders/bulk', updateMultipleOrders);
router.patch('/:id/toggle-active', toggleGalleryActive);
router.delete('/:id', deleteGalleryItem);

export default router;