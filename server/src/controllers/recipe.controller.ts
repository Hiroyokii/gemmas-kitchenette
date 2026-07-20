import { replaceRecipe } from "../services/recipe.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateRecipe = asyncHandler(async (req, res) => {
    const foodId = Number(req.params.foodId);

    const recipe = await replaceRecipe(
        foodId,
        req.body
    );

    res.status(200).json(recipe);
});
