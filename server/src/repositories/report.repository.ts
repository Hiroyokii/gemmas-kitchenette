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
                updatedAt: {
                    gte: start,
                    lt: end,
                },
            },
        });

    const cancelledOrders =
        await prisma.order.count({
            where: {
                status: OrderStatus.CANCELLED,
                updatedAt: {
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