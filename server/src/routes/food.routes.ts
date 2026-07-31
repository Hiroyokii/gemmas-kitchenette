import { Router } from "express";

import { createFood, getFoods, updateFood } from "../controllers/food.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateFoodSchema } from "../schemas/food.schema.js";


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

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    validate(updateFoodSchema),
    updateFood
)

export default router;