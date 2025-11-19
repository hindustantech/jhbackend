
import express from "express";
import { register, login, forgot, change, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate, registerSchema, loginSchema, forgotPasswordSchema, changePasswordSchema } from "../utils/validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgot);
router.post("/change-password", validate(changePasswordSchema), change);
router.post("/logout", protect, logout);

export default router;
