import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterForm } from "../../schemas/register.schema";
import { register as registerRequest } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Input from "../../components/ui/Input";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            setSubmitError(getErrorMessage(error, "Failed to register. Please try again."));
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 px-4 pt-6 pb-10 sm:pt-8">
            <div className="mx-auto w-full max-w-2xl">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-2 w-64">
                        <img
                            src="/gemmas-logo.png"
                            alt="Gemma's Kitchenette"
                            className="h-auto w-full object-contain"
                        />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">
                        Create an account
                    </h1>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                        Set up your delivery details and start ordering
                        home-cooked meals.
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-8"
                >
                    <Alert type="error" message={submitError} />

                    {/* Personal Information */}
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-base font-semibold text-stone-900">
                                Personal information
                            </h2>
                            <p className="mt-1 text-sm text-stone-500">
                                Enter your basic information.
                            </p>
                        </div>

                        {/* First + Last */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label="First name"
                                error={errors.firstName?.message}
                                {...register("firstName")}
                            />

                            <Input
                                label="Last name"
                                error={errors.lastName?.message}
                                {...register("lastName")}
                            />
                        </div>

                        {/* Middle name */}
                        <Input
                            label="Middle name (optional)"
                            error={errors.middleName?.message}
                            {...register("middleName")}
                        />

                        {/* Email */}
                        <Input
                            type="email"
                            label="Email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            error={errors.email?.message}
                            {...register("email")}
                        />

                        {/* Phone */}
                        <Input
                            label="Phone number"
                            placeholder="09XXXXXXXXX"
                            hint="11 digits, no spaces."
                            error={errors.phoneNumber?.message}
                            {...register("phoneNumber")}
                        />

                        {/* Password */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="••••••••"
                                hint="At least 8 characters."
                                autoComplete="new-password"
                                error={errors.password?.message}
                                {...register("password")}
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="text-stone-500 hover:text-orange-600"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        <Icon
                                            name={
                                                showPassword 
                                                    ? "eyeOff" 
                                                    : "eye"
                                                }
                                            className="h-5 w-5"
                                        />
                                    </button>
                                }
                            />

                            {/* Confirm Password */}
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                label="Confirm password"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword((value) => !value)
                                        }
                                        className="text-stone-500 hover:text-orange-600"
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        <Icon
                                            name={
                                                showConfirmPassword
                                                    ? "eyeOff"
                                                    : "eye"
                                            }
                                            className="h-5 w-5"
                                        />
                                    </button>
                                }
                            />
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mt-8 border-t border-stone-200 pt-7">
                        <div className="mb-5">
                            <h2 className="text-base font-semibold text-stone-900">
                                Delivery address
                            </h2>

                            <p className="mt-1 text-sm text-stone-500">
                                Where should we deliver your orders?
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Input
                                    label="Block"
                                    placeholder="e.g. 1"
                                    error={errors.block?.message}
                                    {...register("block")}
                                />

                                <Input
                                    label="Lot"
                                    placeholder="e.g. 12"
                                    error={errors.lot?.message}
                                    {...register("lot")}
                                />

                                <Input
                                    label="Street"
                                    placeholder="Street name"
                                    error={errors.street?.message}
                                    {...register("street")}
                                />
                            </div>

                            <Input
                                label="Landmark (optional)"
                                placeholder="Nearby landmark"
                                error={errors.landmark?.message}
                                {...register("landmark")}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-8">
                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? "Creating account…" : "Create account"}
                        </Button>
                    </div>

                    {/* Login */}
                    <p className="mt-6 text-center text-sm text-stone-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </form>

                <p className="mt-6 text-center text-xs text-stone-400">
                    Home-cooked meals made with care.
                </p>
            </div>
        </div>
    );
}
