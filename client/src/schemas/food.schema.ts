import { z } from "zod";

export const foodSchema = z.object({
    name: z.string().trim().min(2, "Food name is required.").max(100),

    description: z.string().trim().min(5, "Description is required."),

    price: z.coerce
        .number()
        .positive("Price must be greater than zero."),

    categoryId: z.coerce
        .number()
        .int()
        .positive("Category is required."),

    imageUrl: z.string().trim().optional().or(z.literal("")),

    isAvailable: z.boolean(),
})

export type FoodForm = z.infer<typeof foodSchema>;