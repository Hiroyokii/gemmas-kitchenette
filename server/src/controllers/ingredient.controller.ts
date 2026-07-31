import { asyncHandler } from "../utils/asyncHandler.js";
import { createIngredientService, getIngredientsService, updateIngredientService } from "../services/ingredient.service.js";
import { findAllUnits } from "../repositories/ingredient.repository.js";

export const getUnits =
    asyncHandler(async (_, res) => {

        const units =
            await findAllUnits();

        res.status(200).json(units);
        
    });

export const getIngredients =
    asyncHandler(async (_, res) => {

        const ingredients =
            await getIngredientsService();

        res.status(200).json(ingredients);

    });

export const createIngredient = 
    asyncHandler(async (req, res) => {

        const ingredient =
            await createIngredientService(req.body);

        res.status(201).json(ingredient);

    })

export const updateIngredient =
    asyncHandler(async (req, res) => {

        const ingredient =
            await updateIngredientService(
                Number(req.params.id),
                req.body
            );
        
        res.status(200).json(ingredient);
    });