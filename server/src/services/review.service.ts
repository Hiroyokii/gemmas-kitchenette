import { prisma } from "../lib/prisma.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { createReview, findReviewByOrderItem } from "../repositories/review.repository.js";
import type { CreateReviewInput } from "../schemas/review.schema.js";

export async function createReviewService(
    customerId: number, 
    data: CreateReviewInput
) {
    const orderItem = await prisma.orderItem.findFirst({
        where: { 
            id: data.orderItemId, 
            order: { 
                customerId 
            } 
        },
        include: { 
            order: true, 
            dailyMenu: true 
        },
    });

    if (!orderItem) throw new NotFoundError("Order item not found.");

    if (orderItem.order.status !== "COMPLETED") 
        throw new BadRequestError(
            "You can rate an item only after the order is completed."
        );

    if (await findReviewByOrderItem(data.orderItemId)) 
        throw new ConflictError(
            "This item has already been rated."
        );

    return createReview({ 
        ...data, 
        customerId, 
        foodId: (
            await prisma.dailyMenu.findUniqueOrThrow({ 
                where: { 
                    id: orderItem.dailyMenuId 
                } 
            })
        ).foodId 
    });
}
