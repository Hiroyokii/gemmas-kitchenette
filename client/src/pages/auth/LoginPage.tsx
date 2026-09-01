import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginForm } from "../../schemas/login.schema";
import { login } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const navigate = useNavigate();
    const { login: loginContext } = useAuth();
    const [loginError, setLoginError] = useState("");

    async function onSubmit(data: LoginForm) {
        setLoginError("");

        try {
            const response = await login(data);
            loginContext(response.token, response.user);

            switch (response.user.role) {
                case "ADMIN":
                case "STAFF":
                    navigate("/admin");
                    break;
                default:
                    navigate("/");
            }
        } catch {
            setLoginError("Invalid email or password.");
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 px-4 pt-6 pb-10 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
            <div className="w-full">

                {/* Branding */}
                <div className="mb-1 text-center">
                    <div className="mx-auto mb-6 w-64">
                        <img
                            src="/gemmas-logo.png"
                            alt="Gemma's Kitchenette"
                            className="h-full w-full object-contain"
                        />
                    </div>


                </div>

                {/* Login Card */}
                <form
                
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-8"
                >
                    <div className="mb-8 text-center">
               

                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">
                        Welcome back
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
                        Log in to order today's home-cooked meals from
                        Gemma's Kitchenette.
                    </p>
                </div>
                    {/* Error */}
                    <Alert
                        type="error"
                        message={loginError}
                    />

                    <div className="space-y-5">
                        {/* Email */}
                        <Input
                            type="email"
                            label="Email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            error={errors.email?.message}
                            {...register("email")}
                        />

                        {/* Password */}
                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            error={errors.password?.message}
                            {...register("password")}
                        />

                        {/* Login Button */}
                        <div className="pt-1">
                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                isLoading={isSubmitting}
                                className="rounded-xl bg-orange-500 font-semibold text-white shadow-sm hover:bg-orange-600 active:bg-orange-700"
                            >
                                {isSubmitting ? "Logging in…" : "Log in"}
                            </Button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-stone-200" />
                        <span className="text-xs text-stone-400">
                            OR
                        </span>
                        <div className="h-px flex-1 bg-stone-200" />
                    </div>

                    {/* Register */}
                    <p className="text-center text-sm text-stone-500">
                        New here?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </form>

                {/* Footer */}
                
                <p className="mt-6 text-center text-xs text-stone-400">
                    Home-cooked meals made with care.
                </p>
            </div>
        </div>
    </div>
);
}
