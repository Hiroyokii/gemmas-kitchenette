import { prisma } from "../lib/prisma.js";
import type { Prisma, OrderStatus } from "../generated/prisma/index.js";

export async function createOrder(
    tx: Prisma.TransactionClient,
    customerId: number,
    deliveryAddress: string | null,
    total: number,
    orderType: "PICKUP" | "DELIVERY",
    customerOrderNumber: number,
    dailyOrderNumber: number,
    dailyOrderDate: Date,
    notes?: string,
) {
    return tx.order.create({
        data: {
            customerId,
            deliveryAddress,
            total,
            orderType,
            customerOrderNumber,
            dailyOrderNumber,
            dailyOrderDate,
            notes,
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

const paymentInclude = {
    id: true,
    orderId: true,
    method: true,
    status: true,
    rejectionReason: true,
    verifiedAt: true,
    verifiedById: true,
    createdAt: true,
    updatedAt: true,
    proofSubmittedAt: true,
} as const;

const orderInclude = {
    payment: { select: paymentInclude },
    orderItems: { 
        include: { 
            dailyMenu: { 
                include: { 
                    food: true 
                } }, 
                review: true 
            } },
} as const;

export async function findOrdersByCustomer(
    customerId: number
) {
    return prisma.order.findMany({
        where: {
            customerId,
        },
        include: {
            payment: { select: paymentInclude },
            orderItems: {
                include: {
                    dailyMenu: {
                        include: {
                            food: true,
                        },
                    },
                    review: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function findOrderByIdForCustomer(
    id: number,
    customerId: number
) {
    return prisma.order.findFirst({
        where: { id, customerId },
        include: {
            customer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            payment: { select: paymentInclude },
            orderItems: {
                include: orderInclude.orderItems.include,
            },
        },
    });
}

export async function findAllOrders(
    page: number, 
    limit: number,
    orderDate?: Date,
) {
    const skip = (page - 1) * limit;
    const where = orderDate ? { dailyOrderDate: orderDate } : {};
    const [orders, total] = await Promise.all([
        prisma.order.findMany({ 
            where,
            skip, 
            take: limit, 
            include: { 
                ...orderInclude, 
                customer: { 
                    select: { 
                        id: true, 
                        firstName: true, 
                        lastName: true 
                    } } }, 
                    orderBy: { 
                        createdAt: "desc" 
                    } }),
        prisma.order.count({ where }),
    ]);
    return { orders, total };
}

export async function findOrderById(id: number) {
    return prisma.order.findUnique({
        where: {
            id,
        },
        include: { 
            payment: { select: paymentInclude }
        }
    });
}

export async function updateOrderStatus(
    tx: Prisma.TransactionClient, 
    orderId: number, 
    status: OrderStatus
) {
    return tx.order.update({
        where: { 
            id: orderId 
        },
        data: { 
            status,
            completedAt: status === "COMPLETED" ? new Date() : undefined,
            cancelledAt: status === "CANCELLED" ? new Date() : undefined,
        },
        include: { 
            customer: { 
                select: { 
                    id: true, 
                    firstName: true, 
                    lastName: true 
                } }, 
                ...orderInclude },
    });
}

export async function findPaymentForOrder(
    tx: Prisma.TransactionClient,
    orderId: number
) {
    return tx.payment.findUnique({
        where: { orderId },
        include: { order: true },
    });
}
