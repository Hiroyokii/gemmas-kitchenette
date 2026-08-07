import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt, { TokenExpiredError } from "jsonwebtoken";

import type { RegisterInput } from "../schemas/auth.schema.js";
import type { LoginInput } from "../schemas/auth.schema.js";

import {
    findUserByEmail,
    createUser,
    findRoleByName,
    storeRefreshToken,
    findValidRefreshToken,
    revokeRefreshToken,
} from "../repositories/user.repository.js";

import { ConflictError } from "../errors/ConflictError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type AuthUser = {
    id: number;
    firstName: string;
    lastName: string;
    role: { name: string };
}

function signAccessToken(
    user: AuthUser
) {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role.name,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: ACCESS_TOKEN_TTL
        }
    );
}

function hashToken(
    token: string
) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

async function issueTokens(
    user: AuthUser
) {
    const accessToken = signAccessToken(user);
    
    const rawRefreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = hashToken(rawRefreshToken);

    await storeRefreshToken(
        user.id,
        refreshTokenHash,
        new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    );

    return {
        accessToken,
        refreshToken: rawRefreshToken,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role.name,
        },
    };
}

export async function registerUser(
    data: RegisterInput
) {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser){
        throw new ConflictError(
            "Email already registered."
        );
    }

    const passwordHash = await bcrypt.hash(
        data.password,
        12
    );

    const customerRole = await findRoleByName("CUSTOMER");

    if (!customerRole) {
        throw new NotFoundError(
            "Customer role not found."
        );
    }

    const user = await createUser({
        ...data,

        passwordHash,

        roleId: customerRole.id
    });

    return issueTokens({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: { name: customerRole.name },
    });
} 

export async function loginUser(
    data: LoginInput
) {
    const user = 
        await findUserByEmail(data.email);

    if (!user) {
        throw new UnauthorizedError(
            "Invalid email or password."
        );
    }

    const passwordMatch =
        await bcrypt.compare(
            data.password,
            user.passwordHash
        );

    if (!passwordMatch) {
        throw new UnauthorizedError(
            "Invalid email or password."
        );
    }

    return issueTokens(user);
}

export async function refreshSession(
    rawRefreshToken: string
) {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await findValidRefreshToken(tokenHash);

    if (!stored) {
        throw new UnauthorizedError(
            "Session expired. Please log in again."
        );
    }

    await revokeRefreshToken(tokenHash);

    return issueTokens(stored.user);
}

export async function logoutUser(
    rawRefreshToken: string
) {
    const tokenHash = hashToken(rawRefreshToken);

    await revokeRefreshToken(tokenHash);
}