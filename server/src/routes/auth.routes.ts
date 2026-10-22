import express, { Router } from "express";

import { 
    register, 
    login, 
    refresh, 
    logout, 
    getProfile,
    updateProfile,
    updatePassword,
    updateAvatar,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { loginRateLimiter, registerRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", loginRateLimiter, login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Josh
 *               lastName:
 *                 type: string
 *                 example: Dela Cruz
 *               email:
 *                 type: string
 *                 example: josh@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Customer registered successfully.
 */
router.post("/register", registerRateLimiter, register);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange the httpOnly refresh cookie for a new access token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Session refreshed
 *       401:
 *         description: No valid session
 */
router.post("/refresh", refresh);

router.get("/me", authenticate, authorize("CUSTOMER"), getProfile);
router.put("/profile", authenticate, authorize("CUSTOMER"), updateProfile);
router.put("/password", authenticate, authorize("CUSTOMER"), updatePassword);
router.put(
    "/avatar",
    authenticate,
    authorize("CUSTOMER"),
    express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }),
    updateAvatar,
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Revoke the current refresh token and clear the session cookie
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", logout);

export default router;
