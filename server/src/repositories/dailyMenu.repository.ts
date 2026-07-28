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

export async function decreaseRemainingServings(
    tx: Prisma.TransactionClient,
    dailyMenuId: number,
    quantity: number
) {
    return tx.dailyMenu.update({
        where: {
            id: dailyMenuId,
            remainingServings: {
                gte: quantity
            }
        },
        data: {
            remainingServings: {
                decrement: quantity,
            },
        },
    });
}




