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
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

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
            setSubmitError(getErrorMessage(error, "Failed to create your account. Please try again."));
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-8 sm:px-6 sm:py-10">
            <div className="w-full max-w-[42rem]">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-[1.75rem] border border-[#e9e1dc] bg-white px-5 py-7 shadow-[0_18px_55px_rgba(71,50,20,0.08)] sm:px-9 sm:py-8"
                >
                    <header className="mb-7 text-center">
                        <Link to="/" aria-label="Gemma's Kitchenette home" className="inline-flex">
                            <img
                                src="/gemmas-logo2.png"
                                alt="Gemma's Kitchenette"
                                className="h-auto w-52 object-contain sm:w-60"
                            />
                        </Link>
                        <h1 className="mt-5 font-display text-3xl tracking-tight text-stone-900 sm:text-[2.15rem]">
                            Create your account
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-stone-500">
                            Bring a little home-cooked goodness to your day.
                        </p>
                    </header>

                    <Alert type="error" message={submitError} />

                    <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                        <Input
                            label="First name"
                            tone="brand"
                            placeholder="First name"
                            autoComplete="given-name"
                            error={errors.firstName?.message}
                            className="h-12 rounded-xl"
                            {...register("firstName")}
                        />
                        <Input
                            label="Last name"
                            tone="brand"
                            placeholder="Last name"
                            autoComplete="family-name"
                            error={errors.lastName?.message}
                            className="h-12 rounded-xl"
                            {...register("lastName")}
                        />
                        <Input
                            type="email"
                            label="Email"
                            tone="brand"
                            placeholder="Enter your email address"
                            autoComplete="email"
                            error={errors.email?.message}
                            className="h-12 rounded-xl pl-10"
                            leftElement={<Icon name="mail" className="h-4 w-4" />}
                            {...register("email")}
                        />
                        <Input
                            label="Phone number"
                            tone="brand"
                            placeholder="09XXXXXXXXX"
                            autoComplete="tel"
                            inputMode="numeric"
                            hint="Enter 11 digits, no spaces."
                            error={errors.phoneNumber?.message}
                            className="h-12 rounded-xl"
                            {...register("phoneNumber")}
                        />
                        <Input
                            label="Middle name (optional)"
                            tone="brand"
                            placeholder="Middle name"
                            autoComplete="additional-name"
                            error={errors.middleName?.message}
                            className="h-12 rounded-xl sm:col-span-2"
                            {...register("middleName")}
                        />
                        <Input
                            type={showPassword ? "text" : "password"}
                            label="Password"
                            tone="brand"
                            placeholder="Create a password"
                            autoComplete="new-password"
                            error={errors.password?.message}
                            className="h-12 rounded-xl pl-10"
                            leftElement={<Icon name="lock" className="h-4 w-4" />}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    className="text-stone-400 transition-colors hover:text-[#9b6d00]"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                                </button>
                            }
                            {...register("password")}
                        />
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            label="Confirm password"
                            tone="brand"
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                            error={errors.confirmPassword?.message}
                            className="h-12 rounded-xl pl-10"
                            leftElement={<Icon name="lock" className="h-4 w-4" />}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                                    className="text-stone-400 transition-colors hover:text-[#9b6d00]"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    <Icon name={showConfirmPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                                </button>
                            }
                            {...register("confirmPassword")}
                        />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-stone-500">
                        Use at least 8 characters for your password.
                    </p>

                    <section className="mt-6 border-t border-stone-200 pt-5">
                        <div className="mb-3">
                            <h2 className="text-sm font-semibold text-stone-900">Delivery address</h2>
                            <p className="mt-1 text-xs leading-5 text-stone-500">
                                Add your address for delivery orders.
                            </p>
                        </div>
                        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                            <Input
                                label="Block"
                                tone="brand"
                                placeholder="e.g. 1"
                                error={errors.block?.message}
                                className="h-12 rounded-xl"
                                {...register("block")}
                            />
                            <Input
                                label="Lot"
                                tone="brand"
                                placeholder="e.g. 12"
                                error={errors.lot?.message}
                                className="h-12 rounded-xl"
                                {...register("lot")}
                            />
                            <Input
                                label="Street"
                                tone="brand"
                                placeholder="Street name"
                                error={errors.street?.message}
                                className="h-12 rounded-xl"
                                {...register("street")}
                            />
                            <Input
                                label="Landmark (optional)"
                                tone="brand"
                                placeholder="Nearby landmark"
                                error={errors.landmark?.message}
                                className="h-12 rounded-xl"
                                {...register("landmark")}
                            />
                        </div>
                    </section>

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        className="mt-6 h-12 rounded-xl font-semibold text-stone-950 shadow-sm"
                    >
                        {isSubmitting ? "Creating account…" : "Create account"}
                    </Button>

                    <p className="mt-6 text-center text-sm text-stone-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-[#9b6d00] transition-colors hover:text-stone-900 hover:underline">
                            Log in
                        </Link>
                    </p>
                </form>

                <p className="mt-6 text-center font-editorial text-xl text-[#a66f00] sm:text-2xl">
                    Support local. Eat local.
                </p>
            </div>
        </main>
    );
}
