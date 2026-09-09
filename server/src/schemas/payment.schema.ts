import { z } from "zod";

export const rejectPaymentSchema = z.object({
    reason: z.string().trim().min(2, "A rejection reason is required.").max(255),
});
