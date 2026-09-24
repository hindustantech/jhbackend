import express from "express";
import {
    createReview,
    getAllReviews,
    getReviewStats,
    deleteReview,
    sendWhatsApp,
    getCustomerReviews,
    getEmployeeReviews,
    getActiveReviews,
    toggleReviewActive,
    getReviewById
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/stats", getReviewStats);
router.get("/active", getActiveReviews);
router.get("/customer/:phone", getCustomerReviews);
router.get("/employee/:empId", getEmployeeReviews);
router.get("/:id", getReviewById);
router.patch("/:id/active", toggleReviewActive);
router.delete("/:id", deleteReview);
router.post("/whatsapp/send", sendWhatsApp);

export default router;