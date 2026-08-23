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
import Icon from "../../components/ui/Icon";

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
        <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
                        <Icon name="bowl" className="h-6 w-6" />
                    </span>
                    <h1 className="font-display text-3xl font-semibold text-ink-900">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-ink-500">
                        Log in to order today's home-cooked menu.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
                >
                    <Alert type="error" message={loginError} />

                    <Input
                        type="email"
                        label="Email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <Input
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                        {isSubmitting ? "Logging in…" : "Log in"}
                    </Button>

                    <p className="text-center text-sm text-ink-500">
                        New here?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-brand-600 hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
