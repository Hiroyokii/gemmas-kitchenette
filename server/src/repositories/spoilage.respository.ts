import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/index.js";

export async function getSpoilageRecords() {
    return prisma.spoilageRecord.findMany({
        include: { 
            ingredient: { 
                include: { 
                    unit: true 
                } }, 
                recordedBy: { 
                    select: { 
                        firstName: true, 
                        lastName: true 
                    } } },
        orderBy: { 
            createdAt: "desc" 
        },
    });
}
export async function createSpoilage(
    tx: Prisma.TransactionClient, 
    data: { 
        ingredientId: number; 
        quantity: number; 
        unitCost: number; 
        reason: string; 
        notes?: string; 
        recordedById: number 
    }) {
    return tx.spoilageRecord.create({ 
        data, 
        include: { 
            ingredient: { 
                include: { 
                    unit: true 
                } }, 
                recordedBy: { 
                    select: { 
                        firstName: true, 
                        lastName: true 
                } }
            } 
        });
}
