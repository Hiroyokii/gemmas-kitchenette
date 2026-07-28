import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";

import { findFoodById } from "../repositories/food.repository.js"
import { findIngredientById } from "../repositories/purchase.repository.js";
import { createRecipeIngredients, deleteRecipe, getRecipeByFoodId } from "../repositories/recipe.repository.js";

import type { CreateRecipeInput } from "../schemas/recipe.schema.js";

import { NotFoundError } from "../errors/NotFoundError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export async function replaceRecipe(
    foodId: number,
    data: CreateRecipeInput
) {
    const food = 
        await findFoodById(foodId);

    if (!food) {
        throw new NotFoundError(
            "Food not found."
        );
    }

    for (const ingredient of data.ingredients) {
        const existing =
            await findIngredientById(
                ingredient.ingredientId
            );
    
        if (!existing) {
            throw new NotFoundError(
                "Ingredient not found."
            );
        }
    }

    const ingredientIds = data.ingredients.map(
        ingredient => ingredient.ingredientId
    );

    const uniqueIds = new Set(ingredientIds);

    if (ingredientIds.length !== uniqueIds.size) {
        throw new BadRequestError(
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

export async function getRecipeService(
    foodId: number
) {
    const food =
        await findFoodById(foodId);

    if (!food) {
        throw new NotFoundError(
            "Food not found."
        );
    }

    return getRecipeByFoodId(
        foodId
    );
}