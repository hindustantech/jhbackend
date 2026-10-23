import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

const TEMPLATE_CACHE_TTL_MS = 10 * 60 * 1000;
let templateCache = null;
let templateCacheAt = 0;

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

const getApiError = (data, fallback) => {
    if (typeof data?.error === "string") return data.error;
    return data?.error?.message || data?.message || fallback;
};

const getTemplatesUrl = () => {
    const url = new URL(config.whatsappApiUrl);
    return `${url.origin}/api/project/v1/templates`;
};

const fetchJson = async (url) => {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": config.whatsappApiKey,
            "Accept": "application/json"
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(getApiError(data, `Template lookup failed (HTTP ${response.status})`));
    }

    return data;
};

const findTemplate = (templates) => {
    const list = Array.isArray(templates) ? templates : templates?.data || [];
    const templateId = config.whatsappTemplateId;

    return list.find((template) => {
        if (templateId) {
            if (template.id === templateId) return true;
            if (template.templateId === templateId) return true;
            if (template.metaData?.metaTemplateId === templateId) return true;
        }

        return template.name === config.whatsappTemplateName
            && template.language === config.whatsappTemplateLanguage;
    });
};

const resolveTemplate = async () => {
    const templatesUrl = getTemplatesUrl();
    const templateId = config.whatsappTemplateId;

    if (templateId) {
        try {
            const template = await fetchJson(`${templatesUrl}/${encodeURIComponent(templateId)}`);
            if (template?.name) return template;
        } catch (error) {
            logger.warn(
                `WhatsApp template lookup by id "${templateId}" failed (${error.message}); resolving from template list`
            );
        }
    }

    return findTemplate(await fetchJson(templatesUrl));
};

const getWhatsAppTemplate = async () => {
    if (templateCache && Date.now() - templateCacheAt < TEMPLATE_CACHE_TTL_MS) {
        return templateCache;
    }

    const template = await resolveTemplate();

    if (!template) {
        throw new Error(
            `WhatsApp template "${config.whatsappTemplateName}" (${config.whatsappTemplateLanguage}) not found`
        );
    }

    if (template.status !== "APPROVED") {
        throw new Error(`WhatsApp template "${template.name}" is not approved (status: ${template.status})`);
    }

    templateCache = template;
    templateCacheAt = Date.now();
    return template;
};

const MEDIA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let mediaCache = null;

const uploadHeaderMedia = async (imageUrl) => {
    if (mediaCache && mediaCache.url === imageUrl && Date.now() - mediaCache.at < MEDIA_CACHE_TTL_MS) {
        return mediaCache.id;
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
        throw new Error(`Failed to download template header image (HTTP ${imageResponse.status})`);
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageResponse.arrayBuffer();
    const form = new FormData();
    form.append("sessionId", config.whatsappSessionSecret);
    form.append("file", new Blob([imageBuffer], { type: contentType }), "template-header.jpg");

    const uploadUrl = `${new URL(config.whatsappApiUrl).origin}/api/media/upload`;
    const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "X-API-Key": config.whatsappApiKey,
            "Accept": "application/json"
        },
        body: form
    });

    const data = await uploadResponse.json().catch(() => ({}));

    if (!uploadResponse.ok || !data.mediaId) {
        throw new Error(getApiError(data, `Template header media upload failed (HTTP ${uploadResponse.status})`));
    }

    mediaCache = { url: imageUrl, id: data.mediaId, at: Date.now() };
    return data.mediaId;
};

const buildHeader = async (template) => {
    const header = template.components?.find((component) => component.type === "HEADER");
    const format = header?.format;

    if (!format || format === "TEXT") return {};

    if (format !== "IMAGE") {
        throw new Error(`Unsupported template header format "${format}" (only IMAGE is supported)`);
    }

    let mediaId = config.whatsappTemplateImageId;

    if (!mediaId) {
        const imageUrl = config.whatsappTemplateImageUrl || template.metaData?.templateHeaderMediaUrl;
        if (!imageUrl) {
            throw new Error("Template requires an IMAGE header but no image URL or media ID is configured");
        }

        mediaId = await uploadHeaderMedia(imageUrl);
    }

    return { header: { type: "image", id: mediaId } };
};

const buildBodyParams = (template, customerName) => {
    const body = template.components?.find((component) => component.type === "BODY");
    if (!body?.text) return { templateParams: [] };

    const placeholders = [...body.text.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)]
        .map((match) => match[1].trim());
    const uniquePlaceholders = [...new Set(placeholders)];

    if (uniquePlaceholders.length === 0) return { templateParams: [] };

    const value = String(customerName || "Customer").trim();
    const isNamed = uniquePlaceholders.some((name) => !/^\d+$/.test(name));

    if (isNamed) {
        const available = {
            "1": value,
            customer_name: value,
            customer: value,
            name: value
        };
        const missing = uniquePlaceholders.filter((name) => available[name] === undefined);

        if (missing.length > 0) {
            throw new Error(`No value configured for template parameter(s): ${missing.join(", ")}`);
        }

        return {
            templateParams: uniquePlaceholders.map((name) => ({
                parameter_name: name,
                text: available[name]
            })),
            templateBodyText: body.text
        };
    }

    const maxIndex = Math.max(...uniquePlaceholders.map(Number));
    if (maxIndex > 1) {
        throw new Error(
            `Template expects ${maxIndex} positional body parameters but only customerName is available`
        );
    }

    return { templateParams: [value] };
};

const assertStaticButtons = (template) => {
    const buttons = template.components?.find((component) => component.type === "BUTTONS")?.buttons || [];
    const dynamicButtons = buttons.filter((button) => {
        return /\{\{/.test(button.url || "") || /\{\{/.test(button.text || "");
    });

    if (dynamicButtons.length > 0) {
        throw new Error("Template has dynamic button parameters, which are not supported");
    }
};

export const sendWhatsAppTemplate = async (phoneNumber, customerName = "Customer") => {
    const {
        whatsappApiKey,
        whatsappApiUrl,
        whatsappTemplateName,
        whatsappSessionSecret
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

    let template;
    let payload;

    try {
        template = await getWhatsAppTemplate();
        assertStaticButtons(template);

        payload = {
            sessionId: whatsappSessionSecret,
            to: formattedPhone,
            templateName: template.name || whatsappTemplateName,
            languageCode: template.language,
            ...(await buildHeader(template)),
            ...buildBodyParams(template, customerName)
        };
    } catch (error) {
        logger.error(`WhatsApp template preparation failed for ${formattedPhone}: ${error.message}`);
        return { ok: false, message: error.message };
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
            logger.info(
                `WhatsApp template "${payload.templateName}" sent to ${formattedPhone} (templateId: ${template.id})`
            );
            return { ok: true, data };
        }

        logger.error(
            `WhatsApp API error for ${formattedPhone}: ${JSON.stringify(data)} | request: ${JSON.stringify({
                to: payload.to,
                templateName: payload.templateName,
                languageCode: payload.languageCode,
                templateParamCount: payload.templateParams?.length || 0,
                headerType: payload.header?.type || null,
                headerMediaId: payload.header?.id || null
            })}`
        );
        return {
            ok: false,
            message: getApiError(data, "Failed to send WhatsApp template"),
            error: data
        };
    } catch (error) {
        logger.error(`WhatsApp API request failed for ${formattedPhone}:`, error);
        return { ok: false, message: "WhatsApp API request failed", error: error.message };
    }
};
