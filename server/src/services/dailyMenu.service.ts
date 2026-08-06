import { prisma } from "../lib/prisma.js";

import { decreaseIngredientStock} from "../repositories/ingredient.repository.js"
import { findRecipeIngredients } from "../repositories/recipe.repository.js";
import { findFoodById } from "../repositories/food.repository.js";
import { 
    findTodayMenu,
    findDailyMenuByFoodAndDate,
    findTodayMenuForAdmin,
    createDailyMenu,
} from "../repositories/dailyMenu.repository.js";

import type { CreateDailyMenuInput } from "../schemas/dailyMenu.schema.js";

import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export async function prepareDailyFood(
    data: CreateDailyMenuInput
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const food = 
        await findFoodById(data.foodId);

    if (!food) {
        throw new NotFoundError(
            "Food not found."
        );
    }

    const existing = 
        await findDailyMenuByFoodAndDate(
            data.foodId,
            today
        );

    if (existing) {
        throw new ConflictError(
            "Food has already been prepared today."
        );
    }

    const recipe = 
        await findRecipeIngredients(
            data.foodId
        );
    
    if (recipe.length === 0) {
        throw new BadRequestError(
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
            throw new BadRequestError(
                `${recipeIngredient.ingredient.name} has insufficient stock.` 
            );
        }
    }

    return prisma.$transaction(async (tx) => {
        for (const item of required) {
            const updatedRows = await decreaseIngredientStock(
                tx,
                item.ingredientId,
                item.quantity
            );

            if (updatedRows === 0) {
                const recipeIngredient = recipe.find(
                    r => r.ingredientId === item.ingredientId
                )!;

                throw new BadRequestError(
                    `${recipeIngredient.ingredient.name} no longer has enough stock.`
                );
            }
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

export async function getTodayMenuService() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return findTodayMenu(start, end);
}

export async function getTodayMenuForAdminService() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return findTodayMenuForAdmin(start, end);
}