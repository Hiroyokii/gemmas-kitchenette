import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginForm } from "../../schemas/login.schema";
import { login } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Icon from "../../components/ui/Icon";

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const navigate = useNavigate();
    const { login: loginContext } = useAuth();
    const [loginError, setLoginError] = useState("");
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (cooldownSeconds <= 0) return;

        const timer = window.setTimeout(() => {
            setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [cooldownSeconds]);

    async function onSubmit(data: LoginForm) {
        if (cooldownSeconds > 0) return;
        setLoginError("");
        try {
            const response = await login(data);
            loginContext(response.token, response.user);
            navigate(response.user.role === "ADMIN" ? "/admin" : "/");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                const retryAfter = Number(error.response.headers["retry-after"]);
                setCooldownSeconds(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60);
            } else {
                setLoginError("Invalid email or password.");
            }
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-8 sm:px-6">
            <div className="w-full max-w-lg">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-3xl border border-[#eadfce] bg-white px-6 py-8 shadow-[0_18px_55px_rgba(71,50,20,0.09)] sm:px-10 sm:py-10"
                >
                    <div className="mb-7 text-center">
                        <Link to="/" aria-label="Gemma's Kitchenette home" className="inline-flex">
                            <img
                                src="/gemmas-logo2.png"
                                alt="Gemma's Kitchenette"
                                className="h-auto w-56 object-contain sm:w-64"
                            />
                        </Link>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#b98200]">
                            Welcome to Gemma's
                        </p>
                        <h1 className="mt-2 font-display text-3xl tracking-tight text-stone-900 sm:text-4xl">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-stone-500">
                            Log in to order today's home-cooked meals.
                        </p>
                    </div>

                    <Alert
                        type={cooldownSeconds > 0 ? "info" : "error"}
                        message={cooldownSeconds > 0
                            ? `Too many attempts. Try again in ${cooldownSeconds}s.`
                            : loginError}
                    />

                    <div className="mt-6 space-y-5">
                        <Input
                            type="email"
                            label="Email"
                            tone="brand"
                            placeholder="you@example.com"
                            autoComplete="email"
                            error={errors.email?.message}
                            className="h-12 rounded-xl pl-11"
                            leftElement={<Icon name="mail" className="h-4 w-4" />}
                            {...register("email")}
                        />
                        <Input
                            type={showPassword ? "text" : "password"}
                            label="Password"
                            tone="brand"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            error={errors.password?.message}
                            className="h-12 rounded-xl pl-11"
                            leftElement={<Icon name="lock" className="h-4 w-4" />}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    className="text-stone-400 transition hover:text-[#9b6d00]"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
                                </button>
                            }
                            {...register("password")}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={isSubmitting}
                            disabled={cooldownSeconds > 0}
                            className="mt-2 h-12 rounded-xl font-semibold text-stone-950 shadow-sm"
                        >
                            {isSubmitting ? "Logging in…" : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "Log in"}
                            {!isSubmitting && cooldownSeconds === 0 && <Icon name="chevronRight" className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="my-6 flex items-center gap-4" aria-hidden="true">
                        <span className="h-px flex-1 bg-stone-200" />
                        <span className="text-xs text-stone-400">OR</span>
                        <span className="h-px flex-1 bg-stone-200" />
                    </div>

                    <p className="text-center text-sm text-stone-500">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-semibold text-[#9b6d00] hover:text-stone-900 hover:underline">
                            Create one
                        </Link>
                    </p>
                </form>

                <p className="mt-5 text-center text-xs text-stone-500">
                    Home-cooked goodness, made just for you.
                </p>
            </div>
        </main>
    );
}
