import type { HTMLAttributes } from "react";

export default function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 p-4 ${className}`}
            {...rest}
        />
    );
}
