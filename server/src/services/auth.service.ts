import bcrypt from "bcrypt";
import type { RegisterInput } from "../schemas/auth.schema.js";
import {
    findUserByEmail,
    createUser,
    findRoleByName,
} from "../repositories/user.repository.js";

export async function registerUser(data: RegisterInput) {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser){
        throw new Error("Email already registered.");
    }

    const passwordHash = await bcrypt.hash(
        data.password,
        12
    );

    const customerRole = await findRoleByName("CUSTOMER");

    if (!customerRole) {
        throw new Error("Customer role not found.")
    }

    const user = await createUser({
        ...data,

        passwordHash,

        roleId: customerRole.id
    });

    return user;
} 