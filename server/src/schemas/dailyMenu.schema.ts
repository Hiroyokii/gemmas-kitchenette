import { create } from "node:domain";
import { z } from "zod";

export const createDailyMenuSchema = z.object({
    foodId: z.number().int().positive(),

    preparedServings: z.number().int().positive(),
});

export type CreateDailyMenuInput = z.infer<typeof createDailyMenuSchema>;