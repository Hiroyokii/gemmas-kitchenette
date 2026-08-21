import type { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({
    title,
    description,
    icon,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-white/60 px-6 py-12 text-center ${className}`}
        >
            {icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
                    {icon}
                </div>
            )}

            <div>
                <p className="font-display text-lg font-semibold text-ink-800">{title}</p>
                {description && (
                    <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>
                )}
            </div>

            {action}
        </div>
    );
}
