import { Router } from "express";

import { getCategories } from "../controllers/category.controller.js";

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all food categories
 *     responses:
 *       200:
 *         description: List of categories.
 */
router.get("/", getCategories);

export default router;