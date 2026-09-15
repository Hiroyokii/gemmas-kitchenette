import { Prisma } from "../generated/prisma/index.js";
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
            order: { select: { status: true } },
            dailyMenu: { select: { foodId: true } },
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

    try {
        return await createReview({
            ...data,
            customerId,
            foodId: orderItem.dailyMenu.foodId,
        });
    } catch (error) {
        // The unique constraint is the final guard when two submissions race.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictError("This item has already been rated.");
        }

        throw error;
    }
}
