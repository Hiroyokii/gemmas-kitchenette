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