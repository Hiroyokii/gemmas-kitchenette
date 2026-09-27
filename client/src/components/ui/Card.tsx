import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "interactive";
};

export default function Card({
    className = "",
    variant = "default",
    ...rest
}: CardProps) {
    const customClasses = className.split(/\s+/);
    const hasAutoHeight = customClasses.includes("h-auto");
    const hasBasePadding = customClasses.some((token) => /^p-/.test(token));
    const hasMediumPadding = customClasses.some((token) => /^md:p-/.test(token));
    const hasLargePadding = customClasses.some((token) => /^lg:p-/.test(token));
    const hasCustomBorderColor = customClasses.some((className) =>
        /^border-(?:stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral)-/.test(className)
    );
    const hasCustomBackgroundColor = customClasses.some((className) =>
        /^bg-(?:stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral)-/.test(className)
    );

    return (
        <div
            className={`group flex ${hasAutoHeight ? "" : "h-full"} w-full min-w-0 flex-col rounded-2xl border ${
                hasCustomBorderColor ? "" : "border-stone-200"
            } ${hasCustomBackgroundColor ? "" : "bg-white"} ${
                hasBasePadding ? "" : "p-3"
            } ${
                hasBasePadding || hasMediumPadding ? "" : "md:p-3"
            } ${
                hasBasePadding || hasMediumPadding || hasLargePadding ? "" : "lg:p-5"
            } shadow-sm transition-all duration-300 ease-out ${
                variant === "interactive"
                    ? "hover:-translate-y-1 hover:border-[#FFB800] hover:shadow-[0_10px_30px_rgba(255,184,0,0.18)]"
                    : ""
            } ${className}`}
            {...rest}
        />
    );
}
