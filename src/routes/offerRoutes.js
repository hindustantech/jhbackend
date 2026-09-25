import express from "express";
import {
    getActiveOffers,
    getAllOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferActive
} from "../controllers/offerController.js";
import { uploadSingleImage, handleUploadError } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizationMiddleware.js";

const router = express.Router();

// Public
router.get("/", getActiveOffers);

// Admin / protected
router.get("/all", protect, authorize("dashboard:view", "offers:manage"), getAllOffers);
router.get("/:id", protect, authorize("dashboard:view", "offers:manage"), getOfferById);
router.post("/", protect, authorize("offers:manage"), uploadSingleImage, handleUploadError, createOffer);
router.put("/:id", protect, authorize("offers:manage"), uploadSingleImage, handleUploadError, updateOffer);
router.patch("/:id/toggle-active", protect, authorize("offers:manage"), toggleOfferActive);
router.delete("/:id", protect, authorize("offers:manage"), deleteOffer);

export default router;