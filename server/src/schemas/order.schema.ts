import { z } from "zod";

export const orderItemSchema = z.object({
    dailyMenuId: z.number().int().positive(),

    quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
    items: z
        .array(orderItemSchema)
        .min(1, "Order must contain at least one item."),

    deliveryAddress: z
        .string()
        .trim()
        .min(5)
        .max(255),
    paymentMethod: z
        .enum([
            "COD", 
            "GCASH"
        ]),
})

export const referenceSchema = z.object({ 
    referenceNumber: z
    .string()
    .trim()
    .min(4)
    .max(100) 
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;