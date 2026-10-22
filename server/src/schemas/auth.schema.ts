import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string().trim().min(2).max(50),
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

export const updateProfileSchema = z.object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    block: z.string().trim().min(1).max(50),
    lot: z.string().trim().min(1).max(50),
    street: z.string().trim().min(1).max(100),
    landmark: z.string().trim().max(200).nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).max(100),
    newPassword: z.string().min(8).max(100),
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
