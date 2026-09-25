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
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizationMiddleware.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", protect, authorize("reviews:manage"), getAllReviews);
router.get("/stats", protect, authorize("reviews:manage"), getReviewStats);
router.get("/active", getActiveReviews);
router.get("/customer/:phone", protect, authorize("reviews:manage"), getCustomerReviews);
router.get("/employee/:empId", getEmployeeReviews);
router.get("/:id", protect, authorize("reviews:manage"), getReviewById);
router.patch("/:id/active", protect, authorize("reviews:manage"), toggleReviewActive);
router.delete("/:id", protect, authorize("reviews:manage"), deleteReview);
router.post("/whatsapp/send", protect, authorize("reviews:manage"), sendWhatsApp);

export default router;