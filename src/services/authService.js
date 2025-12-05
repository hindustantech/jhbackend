
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, generateOTP } from "../utils/authUtils.js";
import { sendOTP } from "../utils/emailUtils.js";
import { logger } from "../config/logger.js";

export const registerUser = async ({ name, email, mobile, password }) => {
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
        throw Object.assign(new Error("User already exists"), { statusCode: 400 });
    }

    const otp = generateOTP();
    logger.info("otp",otp);
    const user = new User({
        name,
        email,
        mobile,
        password,
        otp,
        otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await user.save();

    const sent = await sendOTP(email, otp);
    if (!sent) {
        throw Object.assign(new Error("Failed to send OTP"), { statusCode: 500 });
    }

    return { message: "User registered, OTP sent to email" };
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
};

export const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const sent = await sendOTP(email, otp);
    if (!sent) {
        throw Object.assign(new Error("Failed to send OTP"), { statusCode: 500 });
    }

    return { message: "OTP sent to email" };
};

export const changePassword = async ({ email, otp, newPassword }) => {
    const user = await User.findOne({ 
        email,
        otp,
        otpExpires: { $gt: new Date() }
    });

    if (!user) {
        throw Object.assign(new Error("Invalid or expired OTP"), { statusCode: 400 });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return { message: "Password changed successfully" };
};

export const logoutUser = async (userId) => {
    const user = await User.findById(userId);
    if (user) {
        user.refreshToken = null;
        await user.save();
    }
    return { message: "Logged out successfully" };
};
