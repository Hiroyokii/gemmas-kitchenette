import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
    createIngredient,
    updateIngredient,
    getIngredients,
    getUnits,
} from "../controllers/ingredient.controller.js";
import { createIngredientSchema, updateIngredientSchema } from "../schemas/ingredient.schema.js";

const router = Router();

router.get(
    "/units",
    authenticate,
    authorize("ADMIN"),
    getUnits
);   

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

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    validate(updateIngredientSchema),
    updateIngredient
)

export default router;