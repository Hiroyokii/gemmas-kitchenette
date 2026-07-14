import { prisma } from "../lib/prisma.js";
import type { Prisma, OrderStatus } from "../generated/prisma/index.js";
import type { CreateFoodInput } from "../schemas/food.schema.js";

export async function findFoodByName(name: string) {
    return prisma.food.findUnique({
        where: {
            name,
        },
    });
}

export async function findCategoryById(id: number) {
    return prisma.category.findUnique({
        where: {
            id,
        },
    });
}

export async function createFood(data: CreateFoodInput) {
    return prisma.food.create({
        data,
    });
}

export async function findFoodById(id: number) {
    return prisma.food.findUnique({
        where: {
            id,
        },
    });
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