import { replaceRecipe, getRecipeService } from "../services/recipe.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateRecipe = asyncHandler(async (req, res) => {
    const foodId = Number(req.params.foodId);

    const recipe = await replaceRecipe(
        foodId,
        req.body
    );

    res.status(200).json(recipe);
});

export const getRecipe = 
    asyncHandler(async (req, res) => {

        const recipe = 
            await getRecipeService(
                Number(req.params.id)
            );
        
        res.json(recipe);
    });