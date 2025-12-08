import express from "express";
import { createBooking, getAllBookings, getBookingById, deleteBooking } from "../controllers/Booking.js";

const router = express.Router();

router.post("/create", createBooking);
router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.delete("/:id", deleteBooking);

export default router;
