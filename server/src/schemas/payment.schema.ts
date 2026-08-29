import { z } from "zod";

export const rejectPaymentSchema = z.object({
    reason: z.string().trim().max(255).optional(),
});