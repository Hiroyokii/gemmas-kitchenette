interface SpinnerProps {
    label?: string;
    className?: string;
}

export default function Spinner({ label = "Loading…", className = "" }: SpinnerProps) {
    return (
        <div className={`flex items-center gap-2 text-sm text-ink-500 ${className}`}>
            <span
                className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ink-300 border-t-brand-500"
                aria-hidden="true"
            />
            {label}
        </div>
    );
}
