import { prisma } from "../lib/prisma.js";
import { OrderStatus } from "../generated/prisma/index.js";

export async function getTodaySalesReport(
    start: Date,
    end: Date
) {
    const completedOrders =
        await prisma.order.findMany({
            where: {
                status: OrderStatus.COMPLETED,
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
        });

    const cancelledOrders =
        await prisma.order.count({
            where: {
                status: OrderStatus.CANCELLED,
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
        });

    return {
        completedOrders,
        cancelledOrders,
    };
}