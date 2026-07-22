import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { 
    loginSchema,
    type LoginForm,
} from "../../schemas/login.schema";

import { login } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: {
            errors,
        },
    } = useForm<LoginForm>({
        resolver:
            zodResolver(loginSchema),
    });

    const navigate = useNavigate();
    
    const { login: loginContext } = useAuth();

    async function onSubmit(
        data: LoginForm
    ) { 
        setLoginError("");
        try {

            const response =
                await login(data);

            loginContext(
                response.token,
                response.user
            );

            navigate("/");

        } catch (error) {
            console.log(error);
            setLoginError("Invalid email or password.");
        }
    }

    const [loginError, setLoginError] = 
        useState("");

    return (
        <div className="min-h-screen flex items-center justify-center">

            <form 
                onSubmit={
                    handleSubmit(onSubmit)
                }
                className="w-full max-w-sm space-y-4"
            >

                <h1 className="text-3xl font-bold">
                    Login
                </h1>

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
                        placeholder="Password"
                        {...register("password")}
                        className="border rounded w-full p-2"
                    />
                
                {errors.password && (
                    <p className="text-red-500 text-sm">
                        {errors.password.message}
                    </p>
                )}    

                </div>

                {loginError && (
                    <p className="text-red-500 text-sm">
                        {loginError}
                    </p>
                )}

                <button
                    className="bg-orange-600 text-white w-full py-2 rounded"
                >
                    Login
                </button>

            </form>

        </div>
    );
} 