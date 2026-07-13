import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/index.js";

export async function findRecipeIngredients(
    foodId: number
) {
    return prisma.recipeIngredient.findMany({
        where: {
            foodId,
        },

        include: {
            ingredient: true,
        }
    })
}

export async function createRecipeIngredients(
    tx: Prisma.TransactionClient,
    foodId: number,
    ingredient: {
        ingredientId: number;
        quantity: number;
    }[]
) {
    return tx.recipeIngredient.createMany({
        data: ingredient.map((ingredient) => ({
            foodId,
            ingredientId: ingredient.ingredientId,
            quantity: ingredient.quantity,
        })),
    });
}

export async function deleteRecipe(
    tx: Prisma.TransactionClient,
    foodId: number
) {
    return tx.recipeIngredient.deleteMany({
        where: {
            foodId,
        },
    });
}

export async function findRecipeByFood(
    foodId: number
) {
    return prisma.recipeIngredient.findMany({
        where: {
            foodId,
        },
        include: {
            ingredient: true,
        },
    });
}

