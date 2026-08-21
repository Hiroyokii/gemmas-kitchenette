import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                    {title}
                </h1>
                {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
            </div>

            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
