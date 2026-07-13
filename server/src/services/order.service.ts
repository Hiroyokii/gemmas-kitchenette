import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/index.js";

import { createOrder, createOrderItems } from "../repositories/order.repository.js";
import { findDailyMenuById, decreaseRemainingServings } from "../repositories/dailyMenu.repository.js";

import type { CreateOrderInput } from "../schemas/order.schema.js";

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
