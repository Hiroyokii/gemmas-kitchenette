import { prisma } from "../lib/prisma.js";
import { OrderStatus, Prisma } from "../generated/prisma/index.js";

import { 
    createOrder, 
    createOrderItems, 
    findOrdersByCustomer, 
    findAllOrders, 
    findOrderById, 
    updateOrderStatus 
} from "../repositories/order.repository.js";
import { findDailyMenuById, decreaseRemainingServings } from "../repositories/dailyMenu.repository.js";

import type { CreateOrderInput } from "../schemas/order.schema.js";

import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export async function createOrderService(
    customerId: number,
    data: CreateOrderInput
) {
    const menuIds = data.items.map(
        item => item.dailyMenuId
    );

    const uniqueIds = new Set(menuIds);

    if (menuIds.length !== uniqueIds.size) {
        throw new BadRequestError(
            "Order contains duplicate menu items."
        );
    }

    const menus: Prisma.DailyMenuGetPayload<{
        include: {
            food: true;
        };
    }> [] = [];

    for (const item of data.items) {
        const menu =
            await findDailyMenuById(
                item.dailyMenuId
            );
        
        if (!menu) {
            throw new NotFoundError(
                "Daily menu not found."
            );
        }

        if (menu.remainingServings < item.quantity) 
            throw new BadRequestError(
                `${menu.food.name} has insufficient servings.`
            );

        menus.push(menu);
    }

    for (const item of data.items) {
        const menu = 
            menus.find(
                menu => menu.id === item.dailyMenuId
            )!;

        if (
            menu.remainingServings < item.quantity
        ) {
            throw new BadRequestError(
                `${menu.food.name} has insufficient servings.`
            );
        }
    }

    const orderItems = 
        data.items.map(item => {
            const menu = 
                menus.find(
                    menu => menu.id === item.dailyMenuId
                )!;
            
            return {
                dailyMenuId: item.dailyMenuId,
                quantity: item.quantity,
                price: Number(menu.food.price),
            };
        });

    const total = 
        orderItems.reduce(
            (sum, item) => 
                sum + item.price * item.quantity,
            0
        );

    return prisma.$transaction(async (tx) => {
        const order = await createOrder(
            tx,
            customerId,
            data.deliveryAddress,
            total
        );

        await createOrderItems(
            tx,
            order.id,
            orderItems
        );

        await tx.payment.create({ 
            data: { 
                orderId: order.id, 
                method: data.paymentMethod, 
                status: data.paymentMethod === "COD" 
                    ? "NOT_APPLICABLE" 
                    : "PENDING" 
                } });

        for (const item of orderItems) {
            const updatedRows = await decreaseRemainingServings(
                tx,
                item.dailyMenuId,
                item.quantity
            );

            if (updatedRows === null) {
                const menu = menus.find(
                    m => m.id === item.dailyMenuId
                )!;

                throw new BadRequestError(
                    `${menu.food.name} no longer has enough servings available.`
                );
            }
        }

        return tx.order.findUniqueOrThrow({ 
            where: { 
                id: order.id 
            }, 
            include: { 
                payment: true, 
                orderItems: { 
                    include: { 
                        dailyMenu: { 
                            include: { 
                                food: true 
                            } 
                        } 
                    } 
                } 
            } 
        });
    });
}

export async function updateOrderStatusService(
    orderId: number,
    status: OrderStatus
) {
    const order = await findOrderById(orderId);

    if (!order) {
        throw new NotFoundError(
            "Order not found."
        )
    }

    const transitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: [
            OrderStatus.CONFIRMED, 
            OrderStatus.CANCELLED
        ], 
        CONFIRMED: [
            OrderStatus.PREPARING
        ], 
        PREPARING: [
            OrderStatus.OUT_FOR_DELIVERY
        ], 
        OUT_FOR_DELIVERY: [
            OrderStatus.COMPLETED
        ], 
        COMPLETED: [], 
        CANCELLED: [],
    };

    if (!transitions[order.status].includes(status)) 
        throw new BadRequestError(
            `Cannot change order from ${order.status} to ${status}.`
        );

    if (order.payment?.method === "GCASH" 
        && order.payment.status !== "VERIFIED" 
        && status === "CONFIRMED"
    ) throw new BadRequestError(
        "GCash payment must be verified before confirming the order."
        );

    return prisma.$transaction((tx) => 
        updateOrderStatus(
            tx, 
            orderId, 
            status
        ));
}

export async function submitPaymentReferenceService(
    orderId: number, 
    customerId: number, 
    referenceNumber: string
) {
    const order = await prisma.order.findFirst({ 
        where: { 
            id: orderId, 
            customerId 
        }, 
        include: { 
            payment: true 
        } 
    });

    if (!order || !order.payment) 
        throw new NotFoundError(
            "Order payment not found."
        );

    if (order.payment.method !== "GCASH") 
        throw new BadRequestError(
            "This order does not use GCash."
        );

    if (order.payment.status === "VERIFIED") 
        throw new BadRequestError(
            "Payment is already verified."
        );

    return prisma.payment.update({ 
        where: { 
            id: order.payment.id 
        }, 
        data: { 
            referenceNumber: referenceNumber.trim(), 
            status: "PENDING", 
            rejectionReason: null 
        } 
    });
}

export async function verifyPaymentService(
    orderId: number, 
    adminId: number
) {
    const payment = await prisma.payment.findUnique({ 
        where: { orderId } 
    });

    if (!payment) throw new NotFoundError("Payment not found.");

    if (payment.method !== "GCASH") 
        throw new BadRequestError(
            "Only GCash payments require verification."
        );

    if (!payment.referenceNumber) 
        throw new BadRequestError(
            "Customer has not submitted a GCash reference number."
        );

    return prisma.$transaction(async (tx) => {
        await tx.payment.update({ 
            where: { 
                id: payment.id 
            }, 
            data: { 
                status: "VERIFIED", 
                verifiedAt: new Date(), 
                verifiedById: adminId, 
                rejectionReason: null 
            } 
        });

        return tx.order.findUniqueOrThrow({ 
            where: { 
                id: orderId 
            }, 
            include: { 
                payment: true, 
                orderItems: { 
                    include: { 
                        dailyMenu: { 
                            include: { 
                                food: true 
                            } 
                        }, 
                        review: 
                        true 
                    } 
                } 
            } 
        });
    });
}

export async function rejectPaymentService(
    orderId: number, 
    reason?: string
) {
    const payment = await prisma.payment.findUnique({ 
        where: { 
            orderId 
        } 
    });

    if (!payment) throw new NotFoundError("Payment not found.");

    if (payment.method !== "GCASH") 
        throw new BadRequestError(
            "Only GCash payments can be rejected."
        );
    
    return prisma.payment.update({ 
        where: { 
            id: payment.id 
        }, 
        data: { 
            status: "REJECTED", 
            rejectionReason: reason?.trim() || "Payment could not be verified.", 
            verifiedAt: null, verifiedById: null 
        } 
    });
}

export async function getMyOrdersService(
    customerId: number
) {
    return findOrdersByCustomer(
        customerId
    );
}

export async function getAllOrdersService(
    page: number,
    limit: number
) {
    const { orders, total } = await findAllOrders(
        page, 
        limit,
    );

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
    };
}



