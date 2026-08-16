import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { ZodError } from "zod";

import { AppError } from "../errors/AppError.js";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            errors: err.issues,
        })
    }

    console.error(err);

    return res.status(500).json({
        message: "Internal Server Error",
    });
}