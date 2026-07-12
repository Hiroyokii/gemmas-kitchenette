import { prisma } from "../lib/prisma.js";

export async function findIngredientById(id: number) {
    return prisma.ingredient.findUnique({
        where: {
            id,
        },
    });
}