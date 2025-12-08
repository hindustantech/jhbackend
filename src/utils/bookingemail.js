import nodemailer from "nodemailer";

export const sendBookingEmail = async (bookingData) => {
    try {
        const { name, email, whatsapp, service, date, time, message } = bookingData;

        // Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // ============================
        // EMAIL 1 → Shop Owner
        // ============================
        const ownerMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.SHOP_OWNER_EMAIL, // send to owner
            subject: "New Booking Received",
            html: `
        <h2>New Booking Details</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Message:</strong> ${message || "No message"}</p>
      `
        };

        // ============================
        // EMAIL 2 → Customer
        // ============================
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // send to customer
            subject: "Your Booking is Confirmed ✔️",
            html: `
        <h2>Thank you for your booking!</h2>
        <p>Your booking details are below:</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>We will contact you shortly on WhatsApp: <strong>${whatsapp}</strong></p>
      `
        };

        // Send both emails
        await transporter.sendMail(ownerMailOptions);
        await transporter.sendMail(customerMailOptions);

        return true;
    } catch (error) {
        console.error("Error sending booking emails:", error);
        return false;
    }
};
