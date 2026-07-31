import { prisma } from "../lib/prisma.js";
import type { Prisma, OrderStatus } from "../generated/prisma/index.js";

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

export async function findAllOrders(
    page: number,
    limit: number
) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            skip,
            take: limit,
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
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
        }),

        prisma.order.count(),
    ]);

    return { orders, total };
}

export async function findOrderById(id: number) {
    return prisma.order.findUnique({
        where: {
            id,
        },
    });
}

export async function updateOrderStatus(
    tx: Prisma.TransactionClient,
    orderId: number,
    status: OrderStatus
) {
    return tx.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
        },
    });
}