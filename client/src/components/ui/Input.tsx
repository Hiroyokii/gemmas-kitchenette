import { forwardRef, useId, type ReactNode } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftElement?: ReactNode;
    rightElement?: ReactNode;
    tone?: "default" | "brand";
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    {
        label,
        error,
        hint,
        id,
        className = "",
        leftElement,
        rightElement,
        tone = "brand",
        ...rest
    },
    ref
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="mb-1.5 block text-sm font-medium text-ink-800"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    ref={ref}
                    id={inputId}
                    aria-invalid={Boolean(error)}
                    className={[
                        "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400",
                        leftElement ? "pl-11" : "",
                        rightElement ? "pr-11" : "",
                        "transition-colors focus:outline-none",
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                            : tone === "brand"
                              ? "border-stone-200 focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]"
                              : "border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30",
                        className,
                    ].join(" ")}
                    {...rest}
                />

                {leftElement && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
                        {leftElement}
                    </div>
                )}

                {rightElement && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {rightElement}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}

            {!error && hint && (
                <p className="mt-1 text-xs text-ink-500">
                    {hint}
                </p>
            )}
        </div>
    );
});

export default Input;
