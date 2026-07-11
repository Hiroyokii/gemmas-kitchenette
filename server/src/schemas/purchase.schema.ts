import { z } from "zod";

export const purchaseItemSchema = z.object({
    ingredientId: z.number().int().positive(),

    quantity: z.number().positive(),

    unitCost: z.number().positive(),
});

export const createPurchaseSchema = z.object({
    items: z
        .array(purchaseItemSchema)
        .min(1, "Purchase must contain at least one item."),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;