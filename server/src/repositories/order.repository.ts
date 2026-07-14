import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/index.js";

export async function createOrder(
    tx: Prisma.TransactionClient,
    customerId: number,
    deliveryAddress: string,
    total: number
) {
    return tx.order.create({
        data: {
            customerId,
            deliveryAddress,
            total,
            status: "PENDING",
        },
    });
}

export async function createOrderItems(
    tx: Prisma.TransactionClient,
    orderId: number,
    items: {
        dailyMenuId: number;
        quantity: number;
        price: number;
    }[]
) {
    return tx.orderItem.createMany({
        data: items.map(item => ({
            orderId,
            dailyMenuId: item.dailyMenuId,
            quantity: item.quantity,
            price: item.price,
        })),
    });
}

export async function findOrdersByCustomer(
    customerId: number
) {
    return prisma.order.findMany({
        where: {
            customerId,
        },
        include: {
            orderItems: {
                include: {
                    dailyMenu: {
                        include: {
                            food: true,
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