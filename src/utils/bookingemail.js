import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

export const sendBookingEmail = async (bookingData) => {

    try {
        const { name, email, whatsapp, service, date, time, message } = bookingData;

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPass
            }
        });

        // // ============================
        // // EMAIL TO SHOP OWNER
        // // ============================
        // const ownerMailOptions = {
        //     from: `"Booking Alert" <${config.emailUser}>`,
        //     to: config.shopowner,
        //     subject: "📩 New Booking Received",
        //     html: `
        //         <h2>New Booking Details</h2>
        //         <p><strong>Name:</strong> ${name}</p>
        //         <p><strong>Email:</strong> ${email}</p>
        //         <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        //         <p><strong>Service:</strong> ${service}</p>
        //         <p><strong>Date:</strong> ${date}</p>
        //         <p><strong>Time:</strong> ${time}</p>
        //         <p><strong>Message:</strong> ${message || "No message provided"}</p>
        //     `
        // };

        // // ============================
        // // EMAIL TO CUSTOMER
        // // ============================
        // const customerMailOptions = {
        //     from: `"Your Shop" <${config.emailUser}>`,
        //     to: email,
        //     subject: "✅ Your Booking is Confirmed",
        //     html: `
        //         <h2>Thank You for Booking!</h2>
        //         <p>Hello <strong>${name}</strong>,</p>
        //         <p>Your booking has been successfully received.</p>
        //         <h3>Booking Summary:</h3>
        //         <p><strong>Service:</strong> ${service}</p>
        //         <p><strong>Date:</strong> ${date}</p>
        //         <p><strong>Time:</strong> ${time}</p>
        //         <p>We will contact you soon on WhatsApp: <strong>${whatsapp}</strong></p>
        //         <br/>
        //         <p>Regards,<br/>Your Shop Team</p>
        //     `
        // };


        const customerMailOptions = {
            from: `"Your Shop" <${config.emailUser}>`,
            to: email,
            subject: "✅ Booking Confirmed - Your Shop",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background-color: #f7f7f7;
                    padding: 20px;
                }
                .email-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%);
                    padding: 40px 30px;
                    text-align: center;
                    color: #ffffff;
                }
                .header-icon {
                    width: 70px;
                    height: 70px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                    font-size: 36px;
                }
                .header h1 {
                    font-size: 28px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .header p {
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 40px 30px;
                }
                .greeting {
                    font-size: 20px;
                    color: #1a1a1a;
                    margin-bottom: 16px;
                    font-weight: 500;
                }
                .intro-text {
                    font-size: 15px;
                    color: #666666;
                    line-height: 1.6;
                    margin-bottom: 32px;
                }
                .confirmation-badge {
                    background-color: #e6f4ea;
                    border-left: 4px solid #34a853;
                    padding: 16px 20px;
                    margin-bottom: 32px;
                    border-radius: 4px;
                }
                .confirmation-badge p {
                    color: #1e8e3e;
                    font-size: 14px;
                    font-weight: 500;
                    margin: 0;
                }
                .booking-card {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 0;
                    margin-bottom: 24px;
                    border: 1px solid #e8e8e8;
                }
                .booking-card-header {
                    background-color: #ffffff;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e8e8e8;
                }
                .booking-card-header h2 {
                    font-size: 18px;
                    color: #1a1a1a;
                    font-weight: 600;
                    margin: 0;
                }
                .booking-details {
                    padding: 24px;
                }
                .detail-item {
                    display: flex;
                    align-items: flex-start;
                    padding: 16px 0;
                    border-bottom: 1px solid #e8e8e8;
                }
                .detail-item:first-child {
                    padding-top: 0;
                }
                .detail-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .detail-icon {
                    width: 40px;
                    height: 40px;
                    background-color: #e3f2fd;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                    flex-shrink: 0;
                    font-size: 20px;
                }
                .detail-content {
                    flex: 1;
                }
                .detail-label {
                    font-size: 13px;
                    color: #666666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                    font-weight: 500;
                }
                .detail-value {
                    font-size: 16px;
                    color: #1a1a1a;
                    font-weight: 500;
                }
                .contact-box {
                    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                    border-radius: 8px;
                    padding: 24px;
                    text-align: center;
                    margin-bottom: 32px;
                }
                .contact-box h3 {
                    color: #ffffff;
                    font-size: 16px;
                    margin-bottom: 12px;
                    font-weight: 600;
                }
                .contact-box p {
                    color: #ffffff;
                    font-size: 14px;
                    margin: 0;
                    opacity: 0.95;
                }
                .whatsapp-number {
                    background-color: rgba(255, 255, 255, 0.2);
                    padding: 8px 16px;
                    border-radius: 20px;
                    display: inline-block;
                    margin-top: 8px;
                    font-weight: 600;
                    font-size: 15px;
                }
                .info-box {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 32px;
                    border-left: 4px solid #0066FF;
                }
                .info-box p {
                    color: #666666;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                }
                .divider {
                    height: 1px;
                    background-color: #e8e8e8;
                    margin: 32px 0;
                }
                .footer-signature {
                    text-align: left;
                }
                .footer-signature p {
                    color: #666666;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 8px;
                }
                .signature-name {
                    color: #1a1a1a;
                    font-weight: 600;
                    font-size: 15px;
                }
                .signature-title {
                    color: #0066FF;
                    font-weight: 500;
                }
                .email-footer {
                    background-color: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e8e8e8;
                }
                .footer-text {
                    color: #999999;
                    font-size: 13px;
                    line-height: 1.6;
                    margin: 0;
                }
                .footer-links {
                    margin-top: 16px;
                }
                .footer-link {
                    color: #0066FF;
                    text-decoration: none;
                    font-size: 13px;
                    margin: 0 12px;
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="header">
                    <div class="header-icon">✓</div>
                    <h1>Booking Confirmed</h1>
                    <p>We look forward to serving you</p>
                </div>
                
                <div class="content">
                    <h2 class="greeting">Hi ${name}! 👋</h2>
                    
                    <p class="intro-text">
                        Great news! Your booking has been confirmed. We've received all your details and are excited to provide you with excellent service.
                    </p>
                    
                    <div class="confirmation-badge">
                        <p>✓ Confirmation sent to ${email}</p>
                    </div>
                    
                    <div class="booking-card">
                        <div class="booking-card-header">
                            <h2>Booking Details</h2>
                        </div>
                        <div class="booking-details">
                            <div class="detail-item">
                                <div class="detail-icon">💼</div>
                                <div class="detail-content">
                                    <div class="detail-label">Service</div>
                                    <div class="detail-value">${service}</div>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-icon">📅</div>
                                <div class="detail-content">
                                    <div class="detail-label">Date</div>
                                    <div class="detail-value">${date}</div>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-icon">🕐</div>
                                <div class="detail-content">
                                    <div class="detail-label">Time</div>
                                    <div class="detail-value">${time}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contact-box">
                        <h3>📱 We'll Contact You Soon</h3>
                        <p>Our team will reach out to you on WhatsApp to confirm your booking</p>
                        <div class="whatsapp-number">${whatsapp}</div>
                    </div>
                    
                    <div class="info-box">
                        <p>
                            <strong>Need to make changes?</strong> Feel free to contact us anytime. 
                            We're here to help make your experience as smooth as possible.
                        </p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="footer-signature">
                        <p>Thank you for choosing us!</p>
                        <p class="signature-name">Your Shop Team</p>
                        <p class="signature-title">Customer Service</p>
                    </div>
                </div>
                
                <div class="email-footer">
                    <p class="footer-text">
                        This is an automated confirmation email.<br>
                        Please do not reply directly to this message.
                    </p>
                    <p class="footer-text" style="margin-top: 12px;">
                        &copy; ${new Date().getFullYear()} Your Shop. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `
        };

        const ownerMailOptions = {
            from: `"Booking System" <${config.emailUser}>`,
            to: config.shopowner,
            subject: "🔔 New Booking - Action Required",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background-color: #f7f7f7;
                    padding: 20px;
                }
                .email-wrapper {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
                    padding: 40px 30px;
                    text-align: center;
                    color: #ffffff;
                }
                .header-icon {
                    width: 70px;
                    height: 70px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                    font-size: 36px;
                }
                .header h1 {
                    font-size: 28px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                .header p {
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 40px 30px;
                }
                .alert-badge {
                    background-color: #fff3cd;
                    border-left: 4px solid #ff9800;
                    padding: 16px 20px;
                    margin-bottom: 32px;
                    border-radius: 4px;
                }
                .alert-badge p {
                    color: #cc7a00;
                    font-size: 14px;
                    font-weight: 600;
                    margin: 0;
                }
                .timestamp {
                    font-size: 13px;
                    color: #666666;
                    margin-bottom: 24px;
                }
                .section {
                    margin-bottom: 32px;
                }
                .section-title {
                    font-size: 14px;
                    color: #666666;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 16px;
                    font-weight: 600;
                }
                .customer-card {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 24px;
                    border: 1px solid #e8e8e8;
                }
                .info-row {
                    display: flex;
                    padding: 12px 0;
                    border-bottom: 1px solid #e8e8e8;
                }
                .info-row:first-child {
                    padding-top: 0;
                }
                .info-row:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .info-label {
                    font-weight: 600;
                    color: #FF6B35;
                    min-width: 120px;
                    font-size: 14px;
                }
                .info-value {
                    color: #1a1a1a;
                    font-size: 14px;
                    word-break: break-word;
                }
                .booking-card {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 24px;
                    border: 1px solid #e8e8e8;
                }
                .message-card {
                    background-color: #e3f2fd;
                    border-radius: 8px;
                    padding: 20px;
                    border-left: 4px solid #2196F3;
                }
                .message-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1976D2;
                    margin-bottom: 12px;
                }
                .message-text {
                    color: #424242;
                    font-size: 14px;
                    line-height: 1.6;
                    font-style: italic;
                }
                .no-message {
                    color: #999999;
                }
                .action-box {
                    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                    border-radius: 8px;
                    padding: 24px;
                    text-align: center;
                    margin-top: 32px;
                }
                .action-box h3 {
                    color: #ffffff;
                    font-size: 18px;
                    margin-bottom: 12px;
                    font-weight: 600;
                }
                .action-box p {
                    color: #ffffff;
                    font-size: 14px;
                    margin-bottom: 16px;
                    opacity: 0.95;
                }
                .whatsapp-button {
                    display: inline-block;
                    background-color: #ffffff;
                    color: #128C7E;
                    padding: 12px 28px;
                    border-radius: 24px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 15px;
                }
                .email-footer {
                    background-color: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e8e8e8;
                }
                .footer-text {
                    color: #999999;
                    font-size: 13px;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="header">
                    <div class="header-icon">🔔</div>
                    <h1>New Booking Received</h1>
                    <p>Customer is waiting for confirmation</p>
                </div>
                
                <div class="content">
                    <div class="alert-badge">
                        <p>⚡ ACTION REQUIRED - Please contact the customer as soon as possible</p>
                    </div>
                    
                    <p class="timestamp">
                        📅 Received on ${new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
                    </p>
                    
                    <div class="section">
                        <div class="section-title">👤 Customer Information</div>
                        <div class="customer-card">
                            <div class="info-row">
                                <div class="info-label">Name:</div>
                                <div class="info-value">${name}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Email:</div>
                                <div class="info-value">${email}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">WhatsApp:</div>
                                <div class="info-value">${whatsapp}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">📋 Booking Information</div>
                        <div class="booking-card">
                            <div class="info-row">
                                <div class="info-label">Service:</div>
                                <div class="info-value">${service}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Date:</div>
                                <div class="info-value">${date}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Time:</div>
                                <div class="info-value">${time}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">💬 Customer Message</div>
                        <div class="message-card">
                            <div class="message-title">Additional Notes:</div>
                            <div class="message-text ${!message ? 'no-message' : ''}">
                                ${message || 'No additional message provided by the customer.'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-box">
                        <h3>📱 Contact Customer Now</h3>
                        <p>Reach out on WhatsApp to confirm the booking details</p>
                        <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" class="whatsapp-button">
                            Open WhatsApp Chat
                        </a>
                    </div>
                </div>
                
                <div class="email-footer">
                    <p class="footer-text">
                        This is an automated notification from your booking system.<br>
                        &copy; ${new Date().getFullYear()} Your Shop Booking System
                    </p>
                </div>
            </div>
        </body>
        </html>
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
