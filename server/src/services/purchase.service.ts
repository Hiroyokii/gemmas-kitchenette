import { prisma } from "../lib/prisma.js";

import { createPurchase, createPurchaseItems, getPurchases } from "../repositories/purchase.repository.js";
import { increaseIngredientStock, findIngredientById } from "../repositories/purchase.repository.js";

import type { CreatePurchaseInput } from "../schemas/purchase.schema.js";

import { NotFoundError } from "../errors/NotFoundError.js";

export async function createPurchaseService(
    data: CreatePurchaseInput,
    userId: number
) {
    for (const item of data.items) {
        const ingredient = await findIngredientById(item.ingredientId);

        if (!ingredient) {
            throw new NotFoundError(
                `Ingredient ${item.ingredientId} not found.`
            );
        }

    }
    const totalCost = data.items.reduce(
        (total, item) => 
            total + item.quantity * item.unitCost,
        0
    );

    return prisma.$transaction(async (tx) => {
        const purchase = await createPurchase(
            tx,
            totalCost,
            userId
        );

        await createPurchaseItems(
            tx,
            purchase.id,
            data.items
        );

        for (const items of data.items) {
            await increaseIngredientStock(
                tx,
                items.ingredientId,
                items.quantity
            );
        }
        
        return purchase;
    });
}

export async function getPurchasesServices() {
    return getPurchases();
}