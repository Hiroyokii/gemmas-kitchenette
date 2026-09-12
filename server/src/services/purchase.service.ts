import { prisma } from "../lib/prisma.js";

import { createPurchase, createPurchaseItems, getExpirationAlertBatches, getPurchases } from "../repositories/purchase.repository.js";
import { increaseIngredientStock, findIngredientById } from "../repositories/purchase.repository.js";

import type { CreatePurchaseInput } from "../schemas/purchase.schema.js";

import { NotFoundError } from "../errors/NotFoundError.js";
import { processExpiredBatchesService } from "./spoilage.service.js";

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

const EXPIRATION_WARNING_DAYS = 3;

function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function getExpirationStatus(daysRemaining: number) {
    if (daysRemaining < 0) {
        return "EXPIRED" as const;
    }

    if (daysRemaining <= EXPIRATION_WARNING_DAYS) {
        return "EXPIRING_SOON" as const;
    }

    return "SAFE" as const;
}

export async function getExpirationAlertsService() {
    await processExpiredBatchesService();
    const today = startOfToday();
    const warningEnd = new Date(today);
    warningEnd.setDate(warningEnd.getDate() + EXPIRATION_WARNING_DAYS);
    const batches = await getExpirationAlertBatches(today, warningEnd);
    const expiredRecords = await prisma.spoilageRecord.findMany({
        where: { reason: "EXPIRED" },
        include: { ingredient: { include: { unit: true } }, purchaseItem: true },
        orderBy: { recordedAt: "desc" },
    });

    const activeAlerts = batches.map((batch) => {
        const expirationDate = new Date(batch.expirationDate!);
        expirationDate.setHours(0, 0, 0, 0);
        const daysRemaining = Math.round(
            (expirationDate.getTime() - today.getTime()) / 86_400_000
        );

        return {
            id: batch.id,
            ingredientName: batch.ingredient.name,
            remainingQuantity: batch.remainingQuantity,
            unit: batch.ingredient.unit.name,
            expirationDate: batch.expirationDate,
            daysRemaining,
            status: getExpirationStatus(daysRemaining),
        };
    });

    return [
        ...expiredRecords.map((record) => ({
            id: record.purchaseItemId,
            ingredientName: record.ingredient.name,
            remainingQuantity: record.quantity,
            unit: record.ingredient.unit.name,
            expirationDate: record.purchaseItem?.expirationDate ?? record.recordedAt,
            daysRemaining: -1,
            status: "EXPIRED" as const,
        })),
        ...activeAlerts,
    ];
}
