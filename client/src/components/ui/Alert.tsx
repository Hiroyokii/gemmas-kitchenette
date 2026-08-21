type AlertType = "error" | "success" | "info";

interface AlertProps {
    type?: AlertType;
    message?: string | null;
}

const STYLES: Record<AlertType, string> = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-leaf-200 bg-leaf-50 text-leaf-700",
    info: "border-gold-100 bg-gold-50 text-gold-600",
};

const ICONS: Record<AlertType, string> = {
    error: "M12 9v4m0 4h.01M10.29 3.86l-8.18 14.14A1 1 0 003 19.5h18a1 1 0 00.89-1.5L13.71 3.86a1 1 0 00-1.72 0z",
    success: "M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default function Alert({ type = "error", message }: AlertProps) {
    if (!message) {
        return null;
    }

    return (
        <div
            role="alert"
            className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${STYLES[type]}`}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[type]} />
            </svg>
            <span>{message}</span>
        </div>
    );
}
