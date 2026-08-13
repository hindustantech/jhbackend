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

const router = express.Router();

// Public
router.get("/", getActiveOffers);

// Admin / protected
router.get("/all", getAllOffers);
router.get("/:id", getOfferById);
router.post("/", uploadSingleImage, handleUploadError, createOffer);
router.put("/:id", uploadSingleImage, handleUploadError, updateOffer);
router.patch("/:id/toggle-active", toggleOfferActive);
router.delete("/:id", deleteOffer);

export default router;