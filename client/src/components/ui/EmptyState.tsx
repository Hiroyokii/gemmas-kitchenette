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
            className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm ${className}`}
        >
            {icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4D6] text-[#D99A00]">
                    {icon}
                </div>
            )}

            <div>
                <p className="font-display text-lg font-semibold text-stone-900">
                    {title}
                </p>

                {description && (
                    <p className="mt-1 max-w-sm text-sm text-stone-500">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </div>
    );
}
