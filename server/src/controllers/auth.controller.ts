import type { Response } from "express";

import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { 
    registerUser, 
    loginUser, 
    refreshSession,
    logoutUser,
} from "../services/auth.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const REFRESH_COOKIE_OPTION = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/auth",
    maxAge: 7 * 24 * 60 * 1000,
}

function setRefreshCookie(
    res: Response,
    refreshToken: string
) {
    res.cookie(
        REFRESH_COOKIE_NAME, 
        refreshToken,
        REFRESH_COOKIE_OPTION
    );
}

function clearRefreshCookie(
    res: Response
) {
    res.clearCookie(
        REFRESH_COOKIE_NAME, {
            httpOnly: REFRESH_COOKIE_OPTION.httpOnly,
            secure: REFRESH_COOKIE_OPTION.secure,
            sameSite: REFRESH_COOKIE_OPTION.sameSite,
            path: REFRESH_COOKIE_OPTION.path,
        }
    );
}

export const register = asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);

    return res.status(201).json({
        message: "Registration successful.",
        token: result.accessToken,
        user: result.user,
    });
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    return res.status(200).json({
        message: "Login successful.",
        token: result.accessToken,
        user: result.user,
    });
});

export const refresh = asyncHandler(async (req, res) => {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!rawRefreshToken) {
        throw new UnauthorizedError(
            "Not authenticated."
        );
    }

    const result = await refreshSession(rawRefreshToken);

    setRefreshCookie(
        res,
        result.refreshToken,
    );

    return res.status(200).json({
        message: "Session refreshed.",
        token: result.accessToken,
        user: result.user,
    })
})

export const logout = asyncHandler(async (req, res) => {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (rawRefreshToken) {
        await logoutUser(rawRefreshToken);
    }

    clearRefreshCookie(res);

    return res.status(200).json({
        message: "Logged out.",
    })
})