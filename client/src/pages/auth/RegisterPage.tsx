import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    registerSchema,
    type RegisterForm,
} from "../../schemas/register.schema";

import { register as registerRequest } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const navigate = useNavigate();
    const { login: loginContext } = useAuth();
    const [submitError, setSubmitError] = useState("");

    async function onSubmit(data: RegisterForm) {
        setSubmitError("");

        try {
            const response = await registerRequest({
                ...data,
                middleName: data.middleName || undefined,
                landmark: data.landmark || undefined,
            });

            loginContext(response.token, response.user);

            navigate("/");
        } catch (error) {
            setSubmitError(
                getErrorMessage(error, "Failed to register. Please try again.")
            );
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-10">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md space-y-4"
            >
                <h1 className="text-3xl font-bold">Create an account</h1>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input
                            placeholder="First name"
                            {...register("firstName")}
                            className="border rounded w-full p-2"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-sm">
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            placeholder="Last name"
                            {...register("lastName")}
                            className="border rounded w-full p-2"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-sm">
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <input
                        placeholder="Middle name (optional)"
                        {...register("middleName")}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                        className="border rounded w-full p-2"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password (min. 8 characters)"
                        {...register("password")}
                        className="border rounded w-full p-2"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div>
                    <input
                        placeholder="Phone number (11 digits)"
                        {...register("phoneNumber")}
                        className="border rounded w-full p-2"
                    />
                    {errors.phoneNumber && (
                        <p className="text-red-500 text-sm">
                            {errors.phoneNumber.message}
                        </p>
                    )}
                </div>

                <p className="text-sm font-medium text-gray-600 pt-2">
                    Delivery address
                </p>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <input
                            placeholder="Block"
                            {...register("block")}
                            className="border rounded w-full p-2"
                        />
                        {errors.block && (
                            <p className="text-red-500 text-sm">
                                {errors.block.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            placeholder="Lot"
                            {...register("lot")}
                            className="border rounded w-full p-2"
                        />
                        {errors.lot && (
                            <p className="text-red-500 text-sm">
                                {errors.lot.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <input
                            placeholder="Street"
                            {...register("street")}
                            className="border rounded w-full p-2"
                        />
                        {errors.street && (
                            <p className="text-red-500 text-sm">
                                {errors.street.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <input
                        placeholder="Landmark (optional)"
                        {...register("landmark")}
                        className="border rounded w-full p-2"
                    />
                </div>

                {submitError && (
                    <p className="text-red-500 text-sm">{submitError}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-600 text-white w-full py-2 rounded disabled:opacity-50"
                >
                    {isSubmitting ? "Creating account..." : "Register"}
                </button>

                <p className="text-sm text-center text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-orange-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}
