import { Router } from "express";

import { 
    register, 
    login, 
    refresh, 
    logout, 
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

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
router.post("/login", authRateLimiter, login);

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
router.post("/register", authRateLimiter, register);

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