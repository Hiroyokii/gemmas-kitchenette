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

export async function findFoods(
    search?: string,
    categoryId?: number
) {
    return prisma.food.findMany({
        where: {
            ...(search && {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            }),

            ...(categoryId && {
                categoryId,
            }),
        },

        orderBy: {
            name: "asc",
        },
    });
}

export async function updateFood(
    id: number,
    data: {
        name: string;
        description: string;
        price: number;
        categoryId: number;
        imageUrl?: string;
        isAvailable: boolean;
    }
) {
    return prisma.food.update({
        where: {
            id,
        },
        data,
        include: {
            category: true,
        },
    });
}