import { prisma } from "../lib/prisma.js";

import { decreaseIngredientStock} from "../repositories/ingredient.repository.js"
import { findRecipeIngredients } from "../repositories/recipe.repository.js";
import { findFoodById } from "../repositories/food.repository.js";
import { 
    findDailyMenuByFoodAndDate,
    createDailyMenu,
} from "../repositories/menu.repository.js";

import type { CreateDailyMenuInput } from "../schemas/dailyMenu.schema.js";

export async function prepareDailyFood(
    data: CreateDailyMenuInput
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const food = await findFoodById(data.foodId);

    if (!food) {
        throw new Error("Food not found.");
    }

    const existing = 
        await findDailyMenuByFoodAndDate(
            data.foodId,
            today
        );

    if (existing) {
        throw new Error(
            "Food has already been prepared today."
        );
    }

    const recipe = 
        await findRecipeIngredients(
            data.foodId
        )
    
    if (recipe.length === 0) {
        throw new Error(
            "Recipe has not been configured."
        );
    }

    const required =
        recipe.map(item => ({
            ingredientId: item.ingredientId,
            quantity:
                Number(item.quantity) *
                data.preparedServings,
        }));

    for (const item of required) {
        const recipeIngredient =
            recipe.find(r => 
                r.ingredientId === item.ingredientId
            )!;
        
        if (
            Number(recipeIngredient.ingredient.currentStock)
            < item.quantity
        ) {
            throw new Error(
                `${recipeIngredient.ingredient.name} has insufficient stock.` 
            );
        }
    }

    return prisma.$transaction(async (tx) => {
        for (const item of required) {
            await decreaseIngredientStock(
                tx,
                item.ingredientId,
                item.quantity
            );
        }

        const dailyMenu =
            await createDailyMenu(
                tx,
                data.foodId,
                today,
                data.preparedServings
            );

        return dailyMenu;
    })
}