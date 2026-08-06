import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/index.js";

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

export async function findDailyMenuByFoodAndDate(
    foodId: number,
    date: Date
) {
    return prisma.dailyMenu.findFirst({
        where: {
            foodId,
            date,
        }
    })
}

export async function createDailyMenu(
    tx: Prisma.TransactionClient,
    foodId: number,
    date: Date,
    preparedServings: number
) {
    return tx.dailyMenu.create({
        data: {
            foodId,
            date,
            preparedServings,
            remainingServings: preparedServings,
        }
    })
}

export async function findTodayMenu(
    start: Date,
    end: Date
) {
    return prisma.dailyMenu.findMany({
        where: {
            date: {
                gte: start,
                lt: end,
            },
            remainingServings: {
                gt: 0,
            },
        },
        include: {
            food: {
                include: {
                    category: true,
                },
            },
        },
        orderBy: {
            food: {
                name: 'asc',
            },
        },
    });
}


export async function decreaseRemainingServings(
    tx: Prisma.TransactionClient,
    dailyMenuId: number,
    quantity: number
) {
    const result = await tx.dailyMenu.updateMany({
        where: {
            id: dailyMenuId,
            remainingServings: {
                gte: quantity,
            },
        },
        data: {
            remainingServings: {
                decrement: quantity,
            },
        },
    });

    return result.count;
}

export async function findTodayMenuForAdmin(
    start: Date,
    end: Date
) {
    return prisma.dailyMenu.findMany({
        where: {
            date: {
                gte: start,
                lt: end,
            },
        },
        include: {
            food: {
                include: {
                    category: true,
                },
            },
        },
        orderBy: {
            food: {
                name: 'asc',
            },
        },
    });
}




