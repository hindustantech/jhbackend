import express from "express";
import { createReview, getAllReviews, getReviewStats, deleteReview, sendWhatsApp } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/stats", getReviewStats);
router.delete("/:id", deleteReview);
router.post("/whatsapp/send", sendWhatsApp);

export default router;
