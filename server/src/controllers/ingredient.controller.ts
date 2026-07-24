import { asyncHandler } from "../utils/asyncHandler.js";
import { createIngredientService, getIngredientsService } from "../services/ingredient.service.js";

export const getIngredients =
    asyncHandler(async (_, res) => {

        const ingredients =
            await getIngredientsService();

        res.json(ingredients);

    });

export const createIngredient = 
    asyncHandler(async (req, res) => {

        const ingredient =
            await createIngredientService(req.body);

        res.status(201).json(ingredient);

    })