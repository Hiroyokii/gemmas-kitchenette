import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { label, error, hint, id, className = "", children, ...rest },
    ref
) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
                    className="mb-1.5 block text-sm font-medium text-ink-800"
                >
                    {label}
                </label>
            )}

            <select
                ref={ref}
                id={selectId}
                aria-invalid={Boolean(error)}
                className={[
                    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900",
                    "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30",
                    error
                        ? "border-red-300 focus:border-red-400"
                        : "border-ink-200 focus:border-brand-400",
                    className,
                ].join(" ")}
                {...rest}
            >
                {children}
            </select>

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {!error && hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        </div>
    );
});

export default Select;
