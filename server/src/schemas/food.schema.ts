import { z } from "zod";

export const createFoodSchema = z.object({
    name: z.string().trim().min(2, "Food name is required.").max(100),

    description: z.string().trim().min(5, "Description is required"),

    price: z.number().positive("Price must be greter than zero."),

    categoryId: z.number().int().positive(),

    imageUrl: z.string().trim().optional(),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;