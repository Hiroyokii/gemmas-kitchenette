import { Router } from "express";

import { createFood, getFoods } from "../controllers/food.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";


const router = Router();

router.get(
    "/",
    getFoods
);

/**
 * @openapi
 * /foods:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get all foods
 *     responses:
 *       200:
 *         description: List of foods.
 */
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createFood
)

export default router;