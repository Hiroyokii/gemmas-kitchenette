import { prisma } from "../lib/prisma.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { getSpoilageRecords, createSpoilage } from "../repositories/spoilage.repository.js";
import type { CreateSpoilageInput } from "../schemas/spoilage.schema.js";

export async function getSpoilageRecordsService() { return getSpoilageRecords(); }

export async function createSpoilageService(
    recordedById: number, 
    data: CreateSpoilageInput
) {
    const ingredient = await prisma.ingredient.findUnique({ 
        where: { 
            id: data.ingredientId 
        } 
    });

    if (!ingredient || !ingredient.isActive) 
        throw new NotFoundError(
            "Ingredient not found."
        );

    if (Number(ingredient.currentStock) < data.quantity) 
        throw new BadRequestError(
            "Spoilage quantity exceeds current stock."
        );

    return prisma.$transaction(async (tx) => {
        await tx.ingredient.update({ 
            where: { 
                id: data.ingredientId 
            }, 
            data: { 
                currentStock: { 
                    decrement: data.quantity 
                } 
            } 
        });

        return createSpoilage(
            tx,
            { 
                ...data, 
                unitCost: Number(ingredient.costPerUnit),
                recordedById 
            }
        );
    });
}
