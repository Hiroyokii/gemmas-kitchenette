import { z } from "zod";

export const createSpoilageSchema = z.object({
    ingredientId: z.number().int().positive(),
    quantity: z.number().positive(),
    reason: z.string().trim().min(2).max(120),
    notes: z.string().trim().max(500).optional(),
});
export type CreateSpoilageInput = z.infer<typeof createSpoilageSchema>;
