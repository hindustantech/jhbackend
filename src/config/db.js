
import mongoose from "mongoose";
import { logger } from "./logger.js";
import { config } from "./index.js";

export const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            logger.info("MongoDB connected successfully");
        });
        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected, attempting to reconnect...");
            setTimeout(connectDB, 5000);
        });
        mongoose.connection.on("error", (err) => {
            logger.error("MongoDB connection error:", err);
        });

        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            heartbeatFrequencyMS: 10000,
        });
    } catch (error) {
        logger.error("MongoDB connection failed:", error);
        throw error;
    }
};
