import { prisma } from "../lib/prisma.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { CreateSpoilageInput } from "../schemas/spoilage.schema.js";
import { findBatch, getAvailableBatches, getSpoilageRecords, reduceBatchAndCreateSpoilage } from "../repositories/spoilage.repository.js";

export async function recordSpoilageService(data: CreateSpoilageInput, userId: number) {
    return prisma.$transaction(async (tx) => {
        const batch = await findBatch(tx, data.purchaseItemId);
        if (!batch) throw new NotFoundError("Inventory batch not found.");
        if (Number(batch.remainingQuantity) < data.quantity) {
            throw new BadRequestError("Spoilage quantity exceeds the available batch quantity.");
        }

        const recorded = await reduceBatchAndCreateSpoilage(
            tx, batch, data.quantity, data.reason, userId, data.notes,
        );
        if (!recorded) throw new BadRequestError("This batch no longer has enough available quantity.");
        return batch;
    });
}

export async function processExpiredBatchesService() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const batches = await prisma.purchaseItem.findMany({
        where: { remainingQuantity: { gt: 0 }, expirationDate: { lt: today } },
        include: { ingredient: true },
    });

    await Promise.all(batches.map((batch) => prisma.$transaction(async (tx) => {
        const current = await findBatch(tx, batch.id);
        if (!current || Number(current.remainingQuantity) <= 0) return;
        await reduceBatchAndCreateSpoilage(
            tx, current, Number(current.remainingQuantity), "EXPIRED", null,
            `Automatically recorded when batch expired on ${batch.expirationDate!.toLocaleDateString()}.`,
        );
    })));
}

export const getSpoilageRecordsService = getSpoilageRecords;

export async function getAvailableBatchesService() {
    await processExpiredBatchesService();
    return getAvailableBatches();
}
