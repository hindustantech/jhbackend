
import { registerUser, loginUser, forgotPassword, changePassword, logoutUser } from "../services/authService.js";
import { logger } from "../config/logger.js";

export const register = async (req, res, next) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "No OTP requested for this user" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // OTP valid → clear otp fields
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        console.error("OTP Verify Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const forgot = async (req, res, next) => {
    try {
        const result = await forgotPassword(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const change = async (req, res, next) => {
    try {
        const result = await changePassword(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const result = await logoutUser(req.user._id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
