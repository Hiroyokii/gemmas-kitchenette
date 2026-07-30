import { z } from "zod";

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "CONFIRMED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "COMPLETED",
        "CANCELLED"
    ]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;