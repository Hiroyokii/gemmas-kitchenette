import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { createIngredient } from "../controllers/ingredient.controller.js";
import { getIngredients } from "../repositories/ingredient.repository.js";
import { createIngredientSchema } from "../schemas/ingredient.schema.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    getIngredients
);

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createIngredientSchema),
    createIngredient
)

export default router;