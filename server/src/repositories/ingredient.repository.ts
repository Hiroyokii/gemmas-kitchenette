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
    const result = await tx.ingredient.updateMany({
        where: {
            id: ingredientId,
            currentStock: {
                gte: quantity,
            },
        },
        data: {
            currentStock: {
                decrement: quantity,
            },
        },
    });

    return result.count;
}

export async function getIngredients() {
    return prisma.ingredient.findMany({
        where: {
            isActive: true,
        },
        include: {
            unit: true,
            purchaseItems: {
                select: {
                    unitCost: true,
                    remainingQuantity: true,
                    expirationDate: true,
                    purchase: {
                        select: { createdAt: true },
                    },
                },
                orderBy: {
                    purchase: { createdAt: "desc" },
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function findIngredientByName(
    name: string
) {
    return prisma.ingredient.findFirst({
        where: {
            name,
            isActive: true,
        },
    });
}

export async function createIngredient(
    data: {
        name: string;
        unitId: number;
        minimumStock: number;
    }
) {
    return prisma.ingredient.create({
        data: {

            ...data,

            currentStock: 0,

            // Ingredient cost is displayed from the latest PurchaseItem.
            // Keep this existing required field only as a legacy fallback.
            costPerUnit: 0,

            isActive: true,

        },
    });
}

export async function findUnitById(
    id: number
) {
    return prisma.unit.findUnique({
        where: {
            id,
        },
    });
}

export async function findAllUnits() {
    return prisma.unit.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

export async function updateIngredient(
    ingredientId: number,
    data: {
        name: string;
        unitId: number;
        minimumStock: number;
    }
) {
    return prisma.ingredient.update({
        where: {
            id: ingredientId
        },
        data,
        include: {
            unit: true,
        },
    });
}
