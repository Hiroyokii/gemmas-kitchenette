import { prisma } from "../lib/prisma.js";
import { OrderStatus, Prisma } from "../generated/prisma/index.js";

import { createOrder, createOrderItems, findOrdersByCustomer, findAllOrders } from "../repositories/order.repository.js";
import { findDailyMenuById, decreaseRemainingServings } from "../repositories/dailyMenu.repository.js";

import type { CreateOrderInput } from "../schemas/order.schema.js";
import { findOrderById, updateOrderStatus } from "../repositories/food.repository.js";

export async function createOrderService(
    customerId: number,
    data: CreateOrderInput
) {
    const menuIds = data.items.map(
        item => item.dailyMenuId
    );

    const uniqueIds = new Set(menuIds);

    if (menuIds.length !== uniqueIds.size) {
        throw new Error(
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
            throw new Error(
                "Daily menu not found."
            );
        }

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
            throw new Error(
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

        for (const item of orderItems) {
            await decreaseRemainingServings(
                tx,
                item.dailyMenuId,
                item.quantity
            );
        }

        return order;
    })
}

export async function updateOrderStatusService(
    orderId: number,
    status: OrderStatus
) {
    const order = await findOrderById(orderId);

    if (!order) {
        throw new Error(
            "Order not found."
        )
    }

    const allowedTransitions: Record<
        OrderStatus,
        OrderStatus[]
    > = {
        PENDING: [
            OrderStatus.CONFIRMED,
            OrderStatus.CANCELLED,
        ],

        CONFIRMED: [
            OrderStatus.PREPARING,
        ],

        PREPARING: [
            OrderStatus.OUT_FOR_DELIVERY,
        ],

        OUT_FOR_DELIVERY: [
            OrderStatus.COMPLETED,
        ],

        COMPLETED: [],
        CANCELLED: [],
    };

    const allowed = 
        allowedTransitions[
            order.status
        ];
    
    if (!allowed.includes(status)) {
        throw new Error(
            `Cannot change order from ${order.status} to ${status}.`
        );
    }

    return prisma.$transaction(async (tx) => {
        return updateOrderStatus(
            tx,
            orderId,
            status
        );
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
    return findAllOrders(
        page,
        limit,
    );
}



