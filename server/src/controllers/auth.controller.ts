import type { Response } from "express";

import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../schemas/auth.schema.js";
import { 
    registerUser, 
    loginUser, 
    refreshSession,
    logoutUser,
    getCustomerProfile,
    saveCustomerProfile,
    saveCustomerAvatar,
    changeCustomerPassword,
} from "../services/auth.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const REFRESH_COOKIE_OPTION = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // Root scope works through Vercel's /api proxy and direct API requests.
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
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

    setRefreshCookie(res, result.refreshToken);

    return res.status(201).json({
        message: "Registration successful.",
        token: result.accessToken,
        user: result.user,
    });
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    setRefreshCookie(res, result.refreshToken);

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

export const getProfile = asyncHandler(async (req, res) => {
    const user = await getCustomerProfile(req.user!.userId);
    return res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await saveCustomerProfile(req.user!.userId, data);
    return res.status(200).json({ message: "Profile updated.", user });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const data = changePasswordSchema.parse(req.body);
    await changeCustomerPassword(
        req.user!.userId,
        data,
        req.cookies?.[REFRESH_COOKIE_NAME],
    );
    return res.status(200).json({ message: "Password updated." });
});

const PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function imageContentMatches(image: Buffer, contentType: string): boolean {
    if (contentType === "image/png") {
        return image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    }
    if (contentType === "image/jpeg") {
        return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
    }
    return contentType === "image/webp"
        && image.toString("ascii", 0, 4) === "RIFF"
        && image.toString("ascii", 8, 12) === "WEBP";
}

export const updateAvatar = asyncHandler(async (req, res) => {
    const contentType = req.headers["content-type"]?.split(";")[0]?.trim();
    if (!contentType || !PROFILE_IMAGE_TYPES.has(contentType) || !Buffer.isBuffer(req.body)) {
        return res.status(400).json({ message: "Choose a JPG, PNG, or WebP image." });
    }
    if (req.body.length === 0 || req.body.length > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "Profile picture must be smaller than 5 MB." });
    }
    if (!imageContentMatches(req.body, contentType)) {
        return res.status(400).json({ message: "Image contents do not match the selected file type." });
    }

    const user = await saveCustomerAvatar(req.user!.userId, req.body, contentType);
    return res.status(200).json({ message: "Profile picture updated.", user });
});
