import express from "express";
import {
    createReview,
    getAllReviews,
    getReviewStats,
    deleteReview,
    sendWhatsApp,
    getCustomerReviews,
    getEmployeeReviews
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/stats", getReviewStats);
router.get("/customer/:phone", getCustomerReviews);
router.get("/employee/:empId", getEmployeeReviews);
router.delete("/:id", deleteReview);
router.post("/whatsapp/send", sendWhatsApp);

export default router;