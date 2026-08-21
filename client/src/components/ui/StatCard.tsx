import type { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: ReactNode;
    hint?: string;
    accent?: "brand" | "leaf" | "gold" | "ink";
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps["accent"]>, string> = {
    brand: "text-brand-600",
    leaf: "text-leaf-600",
    gold: "text-gold-600",
    ink: "text-ink-900",
};

export default function StatCard({ label, value, hint, accent = "ink" }: StatCardProps) {
    return (
        <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                {label}
            </p>
            <p
                className={`mt-1.5 font-mono text-2xl font-semibold ${ACCENT_CLASSES[accent]}`}
            >
                {value}
            </p>
            {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
        </div>
    );
}
