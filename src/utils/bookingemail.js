import nodemailer from "nodemailer";
import { appConfig } from "../config.js";
import { logger } from "../config/logger.js";

export const sendBookingEmail = async (bookingData) => {
    logger.info("bookingdata", bookingData)
    try {
        const { name, email, whatsapp, service, date, time, message } = bookingData;

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: appConfig.emailUser,
                pass: appConfig.emailPass
            }
        });

        // ============================
        // EMAIL TO SHOP OWNER
        // ============================
        const ownerMailOptions = {
            from: `"Booking Alert" <${appConfig.emailUser}>`,
            to: appConfig.shopOwner,
            subject: "📩 New Booking Received",
            html: `
                <h2>New Booking Details</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Message:</strong> ${message || "No message provided"}</p>
            `
        };

        // ============================
        // EMAIL TO CUSTOMER
        // ============================
        const customerMailOptions = {
            from: `"Your Shop" <${appConfig.emailUser}>`,
            to: email,
            subject: "✅ Your Booking is Confirmed",
            html: `
                <h2>Thank You for Booking!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Your booking has been successfully received.</p>
                <h3>Booking Summary:</h3>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p>We will contact you soon on WhatsApp: <strong>${whatsapp}</strong></p>
                <br/>
                <p>Regards,<br/>Your Shop Team</p>
            `
        };

        // Send emails
        await transporter.sendMail(ownerMailOptions);
        await transporter.sendMail(customerMailOptions);

        return true;

    } catch (error) {
        console.error("❌ Error sending booking emails:", error);
        return false;
    }
};
