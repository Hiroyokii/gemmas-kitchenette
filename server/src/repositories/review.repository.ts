import { prisma } from "../lib/prisma.js";

export interface FoodRatingSummary {
    averageRating: number | null;
    reviewCount: number;
}

export async function findFoodRatingSummaries(
    foodIds: number[]
): Promise<Map<number, FoodRatingSummary>> {
    const summaries = await prisma.review.groupBy({
        by: ["foodId"],
        where: { foodId: { in: foodIds } },
        _avg: { rating: true },
        _count: { _all: true },
    });

    return new Map(summaries.map((summary) => [
        summary.foodId,
        {
            averageRating: summary._avg.rating === null
                ? null
                : Math.round(summary._avg.rating * 10) / 10,
            reviewCount: summary._count._all,
        },
    ]));
}

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
