import { prisma } from "../lib/prisma.js";
import type { Prisma, SpoilageReason } from "../generated/prisma/index.js";

export function getSpoilageRecords() {
    return prisma.spoilageRecord.findMany({
        include: {
            ingredient: { include: { unit: true } },
            purchaseItem: { include: { purchase: true } },
            recordedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { recordedAt: "desc" },
    });
}

export function getAvailableBatches() {
    return prisma.purchaseItem.findMany({
        where: { remainingQuantity: { gt: 0 } },
        include: { ingredient: { include: { unit: true } }, purchase: true },
        orderBy: [{ expirationDate: "asc" }, { purchase: { createdAt: "asc" } }],
    });
}

export function findBatch(tx: Prisma.TransactionClient, id: number) {
    return tx.purchaseItem.findUnique({
        where: { id },
        include: { ingredient: true },
    });
}

export async function reduceBatchAndCreateSpoilage(
    tx: Prisma.TransactionClient,
    batch: { id: number; ingredientId: number; unitCost: Prisma.Decimal },
    quantity: number,
    reason: SpoilageReason,
    recordedById: number | null,
    notes?: string,
) {
    const updated = await tx.purchaseItem.updateMany({
        where: { id: batch.id, remainingQuantity: { gte: quantity } },
        data: { remainingQuantity: { decrement: quantity } },
    });

    if (updated.count === 0) return false;

    await tx.ingredient.update({
        where: { id: batch.ingredientId },
        data: { currentStock: { decrement: quantity } },
    });

    await tx.spoilageRecord.create({
        data: {
            ingredientId: batch.ingredientId,
            purchaseItemId: batch.id,
            quantity,
            unitCost: batch.unitCost,
            reason,
            recordedById: recordedById ?? undefined,
            notes: notes || undefined,
        },
    });

    return true;
}
