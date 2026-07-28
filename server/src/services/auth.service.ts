import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import type { RegisterInput } from "../schemas/auth.schema.js";
import type { LoginInput } from "../schemas/auth.schema.js";

import {
    findUserByEmail,
    createUser,
    findRoleByName,
} from "../repositories/user.repository.js";

import { ConflictError } from "../errors/ConflictError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export async function registerUser(data: RegisterInput) {
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

    return user;
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

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role.name,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "15m"
        }
    )

    return {
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role.name,
        },
    };
}