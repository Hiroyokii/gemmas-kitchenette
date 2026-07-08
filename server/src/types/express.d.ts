import "express";

declare global {
    namespace Express {
        interface UserPayload {
            userId: number;
            role: string;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}

export {};