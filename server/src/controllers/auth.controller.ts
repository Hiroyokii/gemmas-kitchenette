import type { Request, Response, NextFunction } from "express";
import { registerSchema } from "../schemas/auth.schema.js";
import { registerUser } from "../services/auth.service.js";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data)

    return res.status(201).json({
        message: "Registration successful.",
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        },
    });
} catch (error) {
    next(error);
}
} 