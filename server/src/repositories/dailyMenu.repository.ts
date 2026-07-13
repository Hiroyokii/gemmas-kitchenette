import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/index.js";

export async function findDailyMenuByFoodAndDate(
    foodId: number,
    date: Date
) {
    return prisma.dailyMenu.findFirst({
        where: {
            foodId,
            date,
        },
    });
}

export async function createDailyMenu(
    tx: Prisma.TransactionClient,
    foodId: number,
    date: Date,
    preparedServings: number,
) {
    return tx.dailyMenu.create({
        data: {
            foodId,
            date,
            preparedServings,
            remainingServings: preparedServings,
        },
    });
}

export async function findDailyMenuById(
    id: number
) {
    return prisma.dailyMenu.findUnique({
        where: {
            id,
        },
        include: {
            food: true,
        },
    });
}

export async function decreaseRemainingServings(
    tx: Prisma.TransactionClient,
    dailyMenuId: number,
    quantity: number
) {
    return tx.dailyMenu.update({
        where: {
            id: dailyMenuId,
        },
        data: {
            remainingServings: {
                decrement: quantity,
            },
        },
    });
}


