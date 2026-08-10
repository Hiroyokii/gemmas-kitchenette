import z from "zod";

export const prepareFoodSchema = z.object({
    foodId: z.coerce
        .number()
        .int()
        .positive("Select a food."),

    preparedServings: z.coerce
        .number()
        .int()
        .positive("Servings must be at least 1."),
});

export type PrepareFoodFormInput = z.input<typeof prepareFoodSchema>;
export type PrepareFoodForm = z.output<typeof prepareFoodSchema>;