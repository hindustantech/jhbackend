import { logger } from "../config/logger.js";

export const authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw Object.assign(new Error("Not authenticated"), { statusCode: 401 });
            }
            if (req.user.role === "super_admin") {
                return next();
            }
            const hasPermission = requiredPermissions.some(perm =>
                req.user.permissions && req.user.permissions.includes(perm)
            );
            if (!hasPermission) {
                throw Object.assign(new Error("Access denied. Required permissions: " + requiredPermissions.join(", ")), { statusCode: 403 });
            }
            next();
        } catch (error) {
            logger.error("Authorization error:", error);
            next(error);
        }
    };
};

export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw Object.assign(new Error("Not authenticated"), { statusCode: 401 });
            }
            if (!allowedRoles.includes(req.user.role)) {
                throw Object.assign(new Error("Access denied. Required role: " + allowedRoles.join(" or ")), { statusCode: 403 });
            }
            next();
        } catch (error) {
            logger.error("Role authorization error:", error);
            next(error);
        }
    };
};

export const requireSuperAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            throw Object.assign(new Error("Not authenticated"), { statusCode: 401 });
        }
        if (req.user.role !== "super_admin") {
            throw Object.assign(new Error("Access denied. Super admin only."), { statusCode: 403 });
        }
        next();
    } catch (error) {
        logger.error("Super admin authorization error:", error);
        next(error);
    }
};
