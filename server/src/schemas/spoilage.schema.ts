import { z } from "zod";

export const createSpoilageSchema = z.object({
    purchaseItemId: z.number().int().positive(),
    quantity: z.number().positive(),
    reason: z.enum(["SPOILED", "WASTE"]),
    notes: z.string().trim().max(500).optional(),
});

export type CreateSpoilageInput = z.infer<typeof createSpoilageSchema>;
