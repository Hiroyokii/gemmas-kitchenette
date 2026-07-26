import { prisma } from "../lib/prisma.js"
import { Prisma } from "../generated/prisma/index.js"
import { CreatePurchaseInput } from "../schemas/purchase.schema.js";

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
    tx: Prisma.TransactionClient,
    purchaseId: number,
    items: CreatePurchaseInput["items"]
) {
    return tx.purchaseItem.createMany({
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
    return tx.ingredient.update({
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

export async function getPurchases() {
    return prisma.purchase.findMany({
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                },
            },
            purchaseItems: {
                include: {
                    ingredient: {
                        include: {
                            unit: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}