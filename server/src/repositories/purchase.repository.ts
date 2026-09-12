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
            remainingQuantity: item.quantity,
            unitCost: item.unitCost,
            expirationDate: item.expirationDate,
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
                    firstName: true,
                    lastName: true,
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

export async function getExpirationAlertBatches(
    today: Date,
    warningEnd: Date
) {
    return prisma.purchaseItem.findMany({
        where: {
            remainingQuantity: { gt: 0 },
            expirationDate: { lte: warningEnd },
        },
        include: {
            ingredient: {
                include: { unit: true },
            },
        },
        orderBy: { expirationDate: "asc" },
    });
}

export async function consumeInventoryBatches(
    tx: Prisma.TransactionClient,
    ingredientId: number,
    quantity: number
) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const batches = await tx.purchaseItem.findMany({
        where: {
            ingredientId,
            remainingQuantity: { gt: 0 },
            OR: [{ expirationDate: null }, { expirationDate: { gte: today } }],
        },
        orderBy: [{ expirationDate: "asc" }, { purchase: { createdAt: "asc" } }],
    });

    let remaining = quantity;
    for (const batch of batches) {
        if (remaining <= 0) break;
        const used = Math.min(remaining, Number(batch.remainingQuantity));
        const updated = await tx.purchaseItem.updateMany({
            where: { id: batch.id, remainingQuantity: { gte: used } },
            data: { remainingQuantity: { decrement: used } },
        });
        if (updated.count === 0) return false;
        remaining -= used;
    }
    return remaining === 0;
}
