import { prisma } from "../lib/prisma.js"
import type { RegisterInput } from "../schemas/auth.schema.js";

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

export async function createUser(data: RegisterInput & {
    passwordHash: string;
    roleId: number;
}) {
    return prisma.user.create({
        data: {
            firstName: data.firstName,
            middleName: data.middleName,
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