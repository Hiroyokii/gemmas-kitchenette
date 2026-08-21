import type { ReactNode } from "react";

type BadgeTone = "neutral" | "brand" | "leaf" | "gold" | "red";

interface BadgeProps {
    tone?: BadgeTone;
    children: ReactNode;
    className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
    neutral: "bg-ink-100 text-ink-600",
    brand: "bg-brand-50 text-brand-600",
    leaf: "bg-leaf-100 text-leaf-700",
    gold: "bg-gold-100 text-gold-600",
    red: "bg-red-100 text-red-700",
};

export default function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
        >
            {children}
        </span>
    );
}
