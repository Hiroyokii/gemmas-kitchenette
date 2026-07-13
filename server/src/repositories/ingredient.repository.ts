import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/index.js";

export async function findIngredientById(id: number) {
    return prisma.ingredient.findUnique({
        where: {
            id,
        },
    });
}

export async function decreaseIngredientStock(
    tx: Prisma.TransactionClient,
    ingredientId: number,
    quantity: number
) {
    return tx.ingredient.update({
        where: {
            id: ingredientId,
        },
        data: {
            currentStock: {
                decrement: quantity,
            },
        },
    });
}