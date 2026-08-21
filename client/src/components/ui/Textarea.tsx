import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { label, error, hint, id, className = "", ...rest },
    ref
) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={textareaId}
                    className="mb-1.5 block text-sm font-medium text-ink-800"
                >
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                id={textareaId}
                aria-invalid={Boolean(error)}
                className={[
                    "w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400",
                    "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30",
                    error
                        ? "border-red-300 focus:border-red-400"
                        : "border-ink-200 focus:border-brand-400",
                    className,
                ].join(" ")}
                {...rest}
            />

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {!error && hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        </div>
    );
});

export default Textarea;
