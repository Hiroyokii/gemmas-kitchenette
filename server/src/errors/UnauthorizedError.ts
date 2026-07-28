import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(401, message);
    }
}