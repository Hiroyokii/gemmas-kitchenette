import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);

    return res.status(201).json({
        message: "Registration successful.",
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        },
    });
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    return res.status(200).json({
        message: "Login successful.",
        ...result,
    });
});

export const me = asyncHandler(async (req, res) => {
    return res.status(200).json({
        message: "Authenticated",
        user: req.user,
    });
});