import { z } from "zod";

export const registerSchema = z.object({
    firstName: z.string().trim().min(2, "First name is required.").max(50),
    middleName: z.string().trim().max(50).optional().or(z.literal("")),
    lastName: z.string().trim().min(2, "Last name is required.").max(50),

    email: z.email("Enter a valid email."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(100),

    phoneNumber: z
        .string()
        .length(11, "Phone number must be exactly 11 digits."),

    block: z.string().trim().min(1, "Block is required."),
    lot: z.string().trim().min(1, "Lot is required."),
    street: z.string().trim().min(1, "Street is required."),
    landmark: z.string().trim().optional().or(z.literal("")),
});

export type RegisterForm = z.infer<typeof registerSchema>;
