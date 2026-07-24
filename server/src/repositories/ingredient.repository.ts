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

export async function getIngredients() {
    return prisma.ingredient.findMany({
        where: {
            isActive: true,
        },
        include: {
            unit: true,
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
        costPerUnit: number;
    }
) {
    return prisma.ingredient.create({
        data: {

            ...data,

            currentStock: 0,

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