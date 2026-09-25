import express from "express";
import { createBooking, getAllBookings, getBookingById, deleteBooking } from "../controllers/Booking.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizationMiddleware.js";

const router = express.Router();

router.post("/create", createBooking);
router.get("/", protect, authorize("bills:manage"), getAllBookings);
router.get("/:id", protect, authorize("bills:manage"), getBookingById);
router.delete("/:id", protect, authorize("bills:manage"), deleteBooking);

export default router;
