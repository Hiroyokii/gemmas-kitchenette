import { Router } from "express"

import { updateRecipe } from "../controllers/recipe.controller.js"

import { authenticate } from "../middleware/auth.middleware.js"
import { authorize } from "../middleware/authorize.middleware.js"
import { validate } from "../middleware/validate.middleware.js"

import { createRecipeSchema } from "../schemas/recipe.schema.js";

const router = Router();

router.put(
    ":foodId",
    authenticate,
    authorize("ADMIN"),
    validate(createRecipeSchema),
    updateRecipe
);

export default router;