import { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export function validate(
    schema: ZodType,
    source: "body" | "query" | "params" = "body"
) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const result =
            schema.safeParse(req[source]);

        if (!result.success) {
            return res.status(400).json({
                errors: result.error.issues,
            });
        }

        req[source] = result.data;

        next();
    };
}