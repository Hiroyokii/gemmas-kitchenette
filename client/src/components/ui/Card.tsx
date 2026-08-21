import type { HTMLAttributes } from "react";

export default function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-xl border border-ink-200 bg-white shadow-[var(--shadow-card)] ${className}`}
            {...rest}
        />
    );
}
