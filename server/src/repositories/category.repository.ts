import { prisma } from "../lib/prisma.js";

export async function findAllCategories() {
    return prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
    });
}