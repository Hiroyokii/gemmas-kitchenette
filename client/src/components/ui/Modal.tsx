import { useEffect } from "react";
import type { ReactNode } from "react";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
};

export default function Modal({
    title,
    onClose,
    children,
    size = "md",
}: ModalProps) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/16 backdrop-blur-[2px] sm:items-center sm:p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
                className={[
                    "max-h-[90vh] w-full overflow-y-auto rounded-t-2xl",
                    "bg-white p-5 shadow-[var(--shadow-pop)]",
                    "sm:rounded-2xl sm:p-6",
                    SIZE_CLASSES[size],
                ].join(" ")}
            >
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="font-display text-xl font-semibold text-ink-900">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                d="M18 6L6 18M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}