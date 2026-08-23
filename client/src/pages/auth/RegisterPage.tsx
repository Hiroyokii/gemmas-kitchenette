import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterForm } from "../../schemas/register.schema";
import { register as registerRequest } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Icon from "../../components/ui/Icon";

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
            setSubmitError(getErrorMessage(error, "Failed to register. Please try again."));
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
            <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
                        <Icon name="bowl" className="h-6 w-6" />
                    </span>
                    <h1 className="font-display text-3xl font-semibold text-ink-900">
                        Create an account
                    </h1>
                    <p className="mt-1 text-sm text-ink-500">
                        Set up delivery to your block and start ordering.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
                >
                    <Alert type="error" message={submitError} />

                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                            Your details
                        </h2>

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

                        <Input
                            label="Middle name (optional)"
                            error={errors.middleName?.message}
                            {...register("middleName")}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                type="email"
                                label="Email"
                                autoComplete="email"
                                error={errors.email?.message}
                                {...register("email")}
                            />
                            <Input
                                type="password"
                                label="Password"
                                hint="At least 8 characters."
                                autoComplete="new-password"
                                error={errors.password?.message}
                                {...register("password")}
                            />
                        </div>

                        <Input
                            label="Phone number"
                            hint="11 digits, no spaces."
                            error={errors.phoneNumber?.message}
                            {...register("phoneNumber")}
                        />
                    </div>

                    <div className="space-y-4 border-t border-ink-100 pt-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
                            Delivery address
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Input
                                label="Block"
                                error={errors.block?.message}
                                {...register("block")}
                            />
                            <Input
                                label="Lot"
                                error={errors.lot?.message}
                                {...register("lot")}
                            />
                            <Input
                                label="Street"
                                error={errors.street?.message}
                                {...register("street")}
                            />
                        </div>

                        <Input
                            label="Landmark (optional)"
                            error={errors.landmark?.message}
                            {...register("landmark")}
                        />
                    </div>

                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        {isSubmitting ? "Creating account…" : "Create account"}
                    </Button>

                    <p className="text-center text-sm text-ink-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-brand-600 hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
