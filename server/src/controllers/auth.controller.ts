import type { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { registerUser, loginUser } from "../services/auth.service.js";

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

export async function login(
    req: Request,
    res: Response,
    next: NextFunction,
){
    try{
        const data = loginSchema.parse(req.body);
        const result = await loginUser(data);

        return res.status(200).json({
            message: "Login successful.",
            ...result,
        });
    } catch (error) {
        next(error)
    }
}

export async function me(
    req: Request,
    res: Response
) {
    return res.status(200).json({
        message: "Authenticated",
        user: req.user,
    });
}