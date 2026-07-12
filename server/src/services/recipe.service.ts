import { prisma } from "../lib/prisma.js";

import { findFoodById } from "../repositories/food.repository.js"
import { findIngredientById } from "../repositories/purchase.repository.js";
import { createRecipeIngredients, deleteRecipe } from "../repositories/recipe.repository.js";

import type { CreateRecipeInput } from "../schemas/recipe.schema.js";

export async function replaceRecipe(
    foodId: number,
    data: CreateRecipeInput
) {
    const food = await findFoodById(foodId);

    if (!food) {
        throw new Error("Food not found.");
    }

    for (const ingredient of data.ingredients) {
        const existing =
            await findIngredientById(
                ingredient.ingredientId
            );
    
        if (!ingredient) {
            throw new Error("Ingredient not found.");
        }
    }

    const ingredientIds = data.ingredients.map(
        ingredient => ingredient.ingredientId
    );

    const uniqueIds = new Set(ingredientIds);

    if (ingredientIds.length !== uniqueIds.size) {
        throw new Error(
            "Recipe contains duplicate ingredients."
        );
    }

    return prisma.$transaction(async (tx) => {
        await deleteRecipe(
            tx, 
            foodId
        );

        await createRecipeIngredients(
            tx,
            foodId,
            data.ingredients
        )
    })
}