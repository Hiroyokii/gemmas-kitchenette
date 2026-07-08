import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string().trim().min(2).max(50),
    middleName: z.string().trim().max(50).optional(),
    lastName: z.string().trim().min(2).max(50),

    email: z.email(),
    password: z.string().min(8).max(100),

    phoneNumber: z.string().min(11).max(11),

    block: z.string().min(1),
    lot: z.string().min(1),
    street: z.string().min(1),
    landmark: z.string().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;