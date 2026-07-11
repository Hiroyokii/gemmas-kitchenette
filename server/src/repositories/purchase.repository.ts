import { prisma } from "../lib/prisma.js"
import { Prisma } from "../generated/prisma/index.js"

export async function findIngredientById(
    id: number
) {
    return prisma.ingredient.findUnique({
        where: {
            id,
        },
    });
}

export async function createPurchase(
    tx: Prisma.TransactionClient,
    totalCost: number,
    createdById: number
) {
    return tx.purchase.create({
        data: {
            totalCost,
            createdById,
        },
    });
}

export async function createPurchaseItems(
    purchaseId: number,
    items: {
        ingredientId: number;
        quantity: number;
        unitCost: number;
    }[]
) {
    return prisma.purchaseItem.createMany({
        data: items.map(item => ({
            purchaseId,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unitCost: item.unitCost,
        })),
    });
}

export async function increaseIngredientStock(
    tx: Prisma.TransactionClient,
    ingredientId: number,
    quantity: number
) {
    return prisma.ingredient.update({
        where: {
            id: ingredientId,
        },

        data: {
            currentStock: {
                increment: quantity,
            },
        },
    });
}