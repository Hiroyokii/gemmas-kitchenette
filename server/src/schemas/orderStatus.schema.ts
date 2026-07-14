import { z } from "zod";

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "CONFIRMED",
        "PREPARED",
        "OUT_FOR_DELIVERY",
        "COMPLETED",
        "CANCELLED"
    ]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;