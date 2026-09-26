import { z } from "zod";

export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
        const parsed = new Date(`${value}T00:00:00.000Z`);
        return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    }, "Choose a valid calendar date.").optional(),
});

export type PaginationInput =
    z.infer<typeof paginationSchema>;
