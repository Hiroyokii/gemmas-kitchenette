import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary:
        "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300",
    secondary:
        "border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 active:bg-stone-100 disabled:text-stone-400",
    ghost:
        "text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:text-stone-400",
    danger:
        "border border-red-200 bg-white text-red-600 hover:bg-red-50 active:bg-red-100 disabled:text-red-300",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        variant = "primary",
        size = "md",
        isLoading = false,
        fullWidth = false,
        disabled,
        className = "",
        children,
        ...rest
    },
    ref
) {
    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={[
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-60",
                VARIANT_CLASSES[variant],
                SIZE_CLASSES[size],
                fullWidth ? "w-full" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            {...rest}
        >
            {isLoading && (
                <span
                    className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}

            {children}
        </button>
    );
});

export default Button;