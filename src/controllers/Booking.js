import Booking from "../models/Booking.js";
import { sendBookingEmail } from "../utils/bookingemail.js";
// ===============================
// Create New Booking
// ===============================
export const createBooking = async (req, res) => {
    try {
        const { name, whatsapp, email, service, date, time, message } = req.body;

        // Validate required fields
        if (!name || !whatsapp || !email || !service || !date || !time) {
            return res.status(400).json({
                ok: false,
                message: "All fields except message are required",
            });
        }

        const newBooking = await Booking.create({
            name,
            whatsapp,
            email,
            service,
            date,
            time,
            message,
        });


        await sendBookingEmail(newBooking);

        return res.status(201).json({
            ok: true,
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        return res.status(500).json({
            ok: false,
            message: "Server error. Please try again later",
            error: error.message,
        });
    }
};

// ===============================
// Get All Bookings
// ===============================
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });

        return res.status(200).json({
            ok: true,
            bookings,
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({
            ok: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// Get Single Booking by ID
// ===============================
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                ok: false,
                message: "Booking not found",
            });
        }

        return res.status(200).json({
            ok: true,
            booking,
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return res.status(500).json({
            ok: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// ===============================
// Delete Booking
// ===============================
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({
                ok: false,
                message: "Booking not found",
            });
        }

        return res.status(200).json({
            ok: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting booking:", error);
        return res.status(500).json({
            ok: false,
            message: "Server error",
            error: error.message,
        });
    }
};
