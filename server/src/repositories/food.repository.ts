import { prisma } from "../lib/prisma.js";
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