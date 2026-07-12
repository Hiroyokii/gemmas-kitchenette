import type { Request, Response } from "express";
import { replaceRecipe } from "../services/recipe.service.js";

export async function updateRecipe(
    req: Request,
    res: Response
) {
    const foodId = Number(req.params.foodId);
    const recipe = await replaceRecipe(
        foodId,
        req.body
    );

    res.status(200).json(recipe);
}
