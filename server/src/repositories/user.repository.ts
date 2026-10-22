import { prisma } from "../lib/prisma.js"
import type { RegisterInput } from "../schemas/auth.schema.js";
import type { UpdateProfileInput } from "../schemas/auth.schema.js";

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            role:true,
        },
    });
}

export async function findUserById(id: number) {
    return prisma.user.findUnique({
        where: { id },
        include: { role: true },
    });
}

export async function updateUserProfile(id: number, data: UpdateProfileInput) {
    return prisma.user.update({
        where: { id },
        data,
        include: { role: true },
    });
}

export async function updateUserAvatar(id: number, avatarUrl: string) {
    return prisma.user.update({
        where: { id },
        data: { avatarUrl },
        include: { role: true },
    });
}

export async function updateUserPassword(id: number, passwordHash: string) {
    return prisma.user.update({
        where: { id },
        data: { passwordHash },
    });
}

export async function revokeOtherRefreshTokens(userId: number, preservedTokenHash?: string) {
    return prisma.refreshToken.updateMany({
        where: {
            userId,
            revokedAt: null,
            ...(preservedTokenHash ? { tokenHash: { not: preservedTokenHash } } : {}),
        },
        data: { revokedAt: new Date() },
    });
}

export async function createUser(data: RegisterInput & {
    passwordHash: string;
    roleId: number;
}) {
    return prisma.user.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,

            email: data.email,
            passwordHash: data.passwordHash,

            phoneNumber: data.phoneNumber,

            block: data.block,
            lot: data.lot,
            street: data.street,
            landmark: data.landmark,

            roleId: data.roleId,
        },
    });
}

export async function findRoleByName(name: string) {
    return prisma.role.findUnique({
        where: {
            name,
        },
    });
}

export async function storeRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date
) {
    return prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });
}

export async function findValidRefreshToken(
    tokenHash: string
) {
    return prisma.refreshToken.findFirst({
        where: {
            tokenHash,
            revokedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
        include: {
            user: {
                include: {
                    role: true
                },
            },
        },
    });
}

export async function revokeRefreshToken(
    tokenHash: string
) {
    return prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null, 
        },
        data: {
            revokedAt: new Date(),
        },
    });
}
