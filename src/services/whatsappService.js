import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

export const sendWhatsAppTemplate = async (phoneNumber, customerName = "Customer", discountPercent = "15") => {
    const { whatsappApiKey, whatsappApiUrl, whatsappTemplateName } = config;

    if (!whatsappApiKey || !whatsappApiUrl || !whatsappTemplateName) {
        logger.warn("WhatsApp API not configured. Skipping template send.");
        return { ok: false, message: "WhatsApp API not configured" };
    }

    // Normalize phone number to +91 format
    let formattedPhone = phoneNumber.replace(/\s/g, "").replace(/^\+/, "");
    if (!formattedPhone.startsWith("91") && formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone;
    }
    if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
    }

    try {
        const response = await fetch(whatsappApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${whatsappApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                to: formattedPhone,
                templateName: whatsappTemplateName,
                variables: {
                    body: {
                        "Customer name": customerName,
                        "Discount percent": discountPercent
                    }
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            logger.info(`WhatsApp template sent to ${formattedPhone}`);
            return { ok: true, data };
        } else {
            logger.error(`WhatsApp API error for ${formattedPhone}: ${JSON.stringify(data)}`);
            return { ok: false, message: data.message || "Failed to send WhatsApp template", error: data };
        }
    } catch (error) {
        logger.error(`WhatsApp API request failed for ${formattedPhone}:`, error);
        return { ok: false, message: "WhatsApp API request failed", error: error.message };
    }
};