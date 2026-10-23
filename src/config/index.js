
import dotenv from "dotenv";

dotenv.config();

export const config = {
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    shopowner:process.env.SHOP_OWNER_EMAIL,
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    whatsappApiKey: process.env.WHATSAPP_API_KEY,
    whatsappApiUrl: process.env.WHATSAPP_API_URL,
    whatsappSessionSecret: process.env.WHATSAPP_SESSION_SECRET,
    whatsappTemplateName: process.env.WHATSAPP_TEMPLATE_NAME
};
