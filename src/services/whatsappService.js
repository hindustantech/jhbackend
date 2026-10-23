import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

const normalizePhoneNumber = (phoneNumber) => {
    let digits = String(phoneNumber || "").replace(/\D/g, "");

    if (digits.length === 11 && digits.startsWith("0")) {
        digits = digits.slice(1);
    }

    if (digits.length === 10) {
        digits = "91" + digits;
    }

    return digits;
};

export const sendWhatsAppTemplate = async (phoneNumber, customerName = "Customer") => {
    const {
        whatsappApiKey,
        whatsappApiUrl,
        whatsappTemplateName,
        whatsappSessionSecret,
        whatsappTemplateLanguage,
        whatsappTemplateImageUrl,
        whatsappTemplateImageId
    } = config;

    if (!whatsappApiKey || !whatsappApiUrl || !whatsappTemplateName || !whatsappSessionSecret) {
        logger.warn("WhatsApp API not configured. Skipping template send.");
        return { ok: false, message: "WhatsApp API not configured" };
    }

    const formattedPhone = normalizePhoneNumber(phoneNumber);
    if (!formattedPhone) {
        logger.warn("WhatsApp template skipped: invalid phone number");
        return { ok: false, message: "Invalid phone number" };
    }

    // "salon" template has an image header and a single body variable: {{1}} = customer name.
    const payload = {
        sessionId: whatsappSessionSecret,
        to: formattedPhone,
        templateName: whatsappTemplateName,
        languageCode: whatsappTemplateLanguage,
        templateParams: [String(customerName || "Customer").trim()]
    };

    if (whatsappTemplateImageId) {
        payload.header = { type: "image", id: whatsappTemplateImageId };
    } else if (whatsappTemplateImageUrl) {
        payload.header = { type: "image", link: whatsappTemplateImageUrl };
    } else {
        logger.warn("WHATSAPP_TEMPLATE_IMAGE_URL/ID is not set; the template expects an image header.");
    }

    try {
        const response = await fetch(whatsappApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${whatsappApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            logger.info(`WhatsApp template sent to ${formattedPhone}`);
            return { ok: true, data };
        }

        const apiMessage = typeof data.error === "string"
            ? data.error
            : data.error?.message || data.message || "Failed to send WhatsApp template";

        logger.error(
            `WhatsApp API error for ${formattedPhone}: ${JSON.stringify(data)} | request: ${JSON.stringify({
                to: payload.to,
                templateName: payload.templateName,
                languageCode: payload.languageCode,
                templateParamCount: payload.templateParams.length,
                headerType: payload.header?.type || null,
                hasHeaderMedia: Boolean(payload.header?.link || payload.header?.id)
            })}`
        );
        return { ok: false, message: apiMessage, error: data };
    } catch (error) {
        logger.error(`WhatsApp API request failed for ${formattedPhone}:`, error);
        return { ok: false, message: "WhatsApp API request failed", error: error.message };
    }
};
