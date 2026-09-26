import { z } from "zod";

export const orderItemSchema = z.object({
    dailyMenuId: z.number().int().positive(),

    quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
    items: z
        .array(orderItemSchema)
        .min(1, "Order must contain at least one item."),

    paymentMethod: z
        .enum([
            "COD", 
            "GCASH"
        ]),
    orderType: z.enum(["PICKUP", "DELIVERY"]),
    notes: z.string().trim().max(500, "Order notes must be 500 characters or less.").optional(),
})

export const paymentProofSchema = z.object({
    screenshotDataUrl: z.string().min(1).max(2_800_100),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
