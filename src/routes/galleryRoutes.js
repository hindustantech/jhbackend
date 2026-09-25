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
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllGalleryItems);
router.get('/position/:position', getGalleryByPosition);
router.get('/:id', getGalleryItemById);

// Protected routes (add auth middleware if needed)
router.post(
  '/',
  protect,
  authorize("gallery:manage"),
  uploadSingleImage,
  handleUploadError,
  createGalleryItem
);

router.put(
  '/:id',
  protect,
  authorize("gallery:manage"),
  uploadSingleImage,
  handleUploadError,
  updateGalleryItem
);

router.put('/orders/bulk', protect, authorize("gallery:manage"), updateMultipleOrders);
router.patch('/:id/toggle-active', protect, authorize("gallery:manage"), toggleGalleryActive);
router.delete('/:id', protect, authorize("gallery:manage"), deleteGalleryItem);

export default router;