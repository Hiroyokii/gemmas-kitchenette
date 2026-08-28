import { prisma } from "../lib/prisma.js";

export async function createReview(
    data: { 
        orderItemId: number; 
        customerId: number; 
        foodId: number; 
        rating: number; 
        comment?: string 
    }) {
    return prisma.review.create({ data });
}

export async function findReviewByOrderItem(
    orderItemId: number
) {
    return prisma.review.findUnique({ 
        where: { 
            orderItemId 
        } });
}
