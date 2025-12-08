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
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); padding: 40px 30px; text-align: center;">
                                    <div style="width: 70px; height: 70px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 36px; line-height: 70px;">✓</div>
                                    <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">Booking Confirmed</h1>
                                    <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.9;">We look forward to serving you</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="font-size: 20px; color: #1a1a1a; margin: 0 0 16px 0; font-weight: 500;">Hi ${name}! 👋</h2>
                                    
                                    <p style="font-size: 15px; color: #666666; line-height: 1.6; margin: 0 0 32px 0;">
                                        Great news! Your booking has been confirmed. We've received all your details and are excited to provide you with excellent service.
                                    </p>
                                    
                                    <!-- Confirmation Badge -->
                                    <div style="background-color: #e6f4ea; border-left: 4px solid #34a853; padding: 16px 20px; margin-bottom: 32px; border-radius: 4px;">
                                        <p style="color: #1e8e3e; font-size: 14px; font-weight: 500; margin: 0;">✓ Confirmation sent to ${email}</p>
                                    </div>
                                    
                                    <!-- Booking Card -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px; border: 1px solid #e8e8e8;">
                                        <tr>
                                            <td style="background-color: #ffffff; padding: 20px 24px; border-bottom: 1px solid #e8e8e8;">
                                                <h2 style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin: 0;">Booking Details</h2>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 24px;">
                                                <!-- Service -->
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                    <tr>
                                                        <td width="40" style="vertical-align: top;">
                                                            <div style="width: 40px; height: 40px; background-color: #e3f2fd; border-radius: 8px; text-align: center; line-height: 40px; font-size: 20px;">💼</div>
                                                        </td>
                                                        <td style="padding-left: 16px; vertical-align: top;">
                                                            <div style="font-size: 13px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 500;">SERVICE</div>
                                                            <div style="font-size: 16px; color: #1a1a1a; font-weight: 500;">${service}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <div style="height: 1px; background-color: #e8e8e8; margin: 16px 0;"></div>
                                                
                                                <!-- Date -->
                                                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                    <tr>
                                                        <td width="40" style="vertical-align: top;">
                                                            <div style="width: 40px; height: 40px; background-color: #e3f2fd; border-radius: 8px; text-align: center; line-height: 40px; font-size: 20px;">📅</div>
                                                        </td>
                                                        <td style="padding-left: 16px; vertical-align: top;">
                                                            <div style="font-size: 13px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 500;">DATE</div>
                                                            <div style="font-size: 16px; color: #1a1a1a; font-weight: 500;">${date}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <div style="height: 1px; background-color: #e8e8e8; margin: 16px 0;"></div>
                                                
                                                <!-- Time -->
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td width="40" style="vertical-align: top;">
                                                            <div style="width: 40px; height: 40px; background-color: #e3f2fd; border-radius: 8px; text-align: center; line-height: 40px; font-size: 20px;">🕐</div>
                                                        </td>
                                                        <td style="padding-left: 16px; vertical-align: top;">
                                                            <div style="font-size: 13px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 500;">TIME</div>
                                                            <div style="font-size: 16px; color: #1a1a1a; font-weight: 500;">${time}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Contact Box -->
                                    <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
                                        <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">📱 We'll Contact You Soon</h3>
                                        <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; opacity: 0.95;">Our team will reach out to you on WhatsApp to confirm your booking</p>
                                        <div style="background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 8px; font-weight: 600; font-size: 15px; color: #ffffff;">${whatsapp}</div>
                                    </div>
                                    
                                    <!-- Info Box -->
                                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #0066FF;">
                                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                                            <strong>Need to make changes?</strong> Feel free to contact us anytime. 
                                            We're here to help make your experience as smooth as possible.
                                        </p>
                                    </div>
                                    
                                    <!-- Divider -->
                                    <div style="height: 1px; background-color: #e8e8e8; margin: 32px 0;"></div>
                                    
                                    <!-- Signature -->
                                    <div>
                                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">Thank you for choosing us!</p>
                                        <p style="color: #1a1a1a; font-weight: 600; font-size: 15px; margin: 0 0 4px 0;">Your Shop Team</p>
                                        <p style="color: #0066FF; font-weight: 500; font-size: 14px; margin: 0;">Customer Service</p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e8e8e8;">
                                    <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
                                        This is an automated confirmation email.<br>
                                        Please do not reply directly to this message.
                                    </p>
                                    <p style="color: #999999; font-size: 13px; margin: 0;">
                                        &copy; ${new Date().getFullYear()} Your Shop. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
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
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px 30px; text-align: center;">
                                    <div style="width: 70px; height: 70px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-block; text-align: center; line-height: 70px; margin: 0 auto 16px auto; font-size: 36px;">🔔</div>
                                    <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0 0 8px 0;">New Booking Received</h1>
                                    <p style="color: #ffffff; font-size: 16px; margin: 0; opacity: 0.9;">Customer is waiting for confirmation</p>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    
                                    <!-- Alert Badge -->
                                    <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 16px 20px; margin-bottom: 32px; border-radius: 4px;">
                                        <p style="color: #cc7a00; font-size: 14px; font-weight: 600; margin: 0;">⚡ ACTION REQUIRED - Please contact the customer as soon as possible</p>
                                    </div>
                                    
                                    <p style="font-size: 13px; color: #666666; margin: 0 0 24px 0;">
                                        📅 Received on ${new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
                                    </p>
                                    
                                    <!-- Customer Information -->
                                    <div style="margin-bottom: 32px;">
                                        <div style="font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-weight: 600;">👤 CUSTOMER INFORMATION</div>
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; border: 1px solid #e8e8e8;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                                                        <span style="font-weight: 600; color: #FF6B35; font-size: 14px; display: inline-block; width: 120px;">Name:</span>
                                                        <span style="color: #1a1a1a; font-size: 14px;">${name}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                                                        <span style="font-weight: 600; color: #FF6B35; font-size: 14px; display: inline-block; width: 120px;">Email:</span>
                                                        <span style="color: #1a1a1a; font-size: 14px;">${email}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0;">
                                                        <span style="font-weight: 600; color: #FF6B35; font-size: 14px; display: inline-block; width: 120px;">WhatsApp:</span>
                                                        <span style="color: #1a1a1a; font-size: 14px;">${whatsapp}</span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    <!-- Booking Information -->
                                    <div style="margin-bottom: 32px;">
                                        <div style="font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-weight: 600;">📋 BOOKING INFORMATION</div>
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; border: 1px solid #e8e8e8;">
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                                                        <span style="font-weight: 600; color: #FF6B35; font-size: 14px; display: inline-block; width: 120px;">Service:</span>
                                                        <span style="color: #1a1a1a; font-size: 14px;">${service}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                                                        <span style="font-weight: 600; color: #FF6B35; font-size: 14px; display: inline-block; width: 120px;">Date:</span>
                                                        <span style="color: #1a1a1a; font-size: 14px;">${date}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0;">
                                                        <span style="font-weight: 600; color: #FF6B35; font-size: 14px; display: inline-block; width: 120px;">Time:</span>
                                                        <span style="color: #1a1a1a; font-size: 14px;">${time}</span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    <!-- Customer Message -->
                                    <div style="margin-bottom: 32px;">
                                        <div style="font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; font-weight: 600;">💬 CUSTOMER MESSAGE</div>
                                        <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; border-left: 4px solid #2196F3;">
                                            <div style="font-size: 14px; font-weight: 600; color: #1976D2; margin-bottom: 12px;">Additional Notes:</div>
                                            <div style="color: ${message ? '#424242' : '#999999'}; font-size: 14px; line-height: 1.6; font-style: italic;">
                                                ${message || 'No additional message provided by the customer.'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Action Box -->
                                    <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); border-radius: 8px; padding: 24px; text-align: center; margin-top: 32px;">
                                        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0; font-weight: 600;">📱 Contact Customer Now</h3>
                                        <p style="color: #ffffff; font-size: 14px; margin: 0 0 16px 0; opacity: 0.95;">Reach out on WhatsApp to confirm the booking details</p>
                                        <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #ffffff; color: #128C7E; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 15px;">
                                            Open WhatsApp Chat
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e8e8e8;">
                                    <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0;">
                                        This is an automated notification from your booking system.<br>
                                        &copy; ${new Date().getFullYear()} Your Shop Booking System
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
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
