import { Router } from "express"

import { getRecipe, updateRecipe } from "../controllers/recipe.controller.js"

import { authenticate } from "../middleware/auth.middleware.js"
import { authorize } from "../middleware/authorize.middleware.js"
import { validate } from "../middleware/validate.middleware.js"

import { createRecipeSchema } from "../schemas/recipe.schema.js";

const router = Router();

router.get(
    "/:foodId",
    authenticate,
    authorize("ADMIN"),
    getRecipe
)

router.put(
    "/:foodId",
    authenticate,
    authorize("ADMIN"),
    validate(createRecipeSchema),
    updateRecipe
);

export default router;