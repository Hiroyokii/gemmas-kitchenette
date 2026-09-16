interface StarRatingProps {
    rating: number;
    className?: string;
}

export default function StarRating({ rating, className = "" }: StarRatingProps) {
    const normalizedRating = Number.isFinite(rating)
        ? Math.max(0, Math.min(rating, 5))
        : 0;
    const fillWidth = `${(normalizedRating / 5) * 100}%`;

    return (
        <span
            role="img"
            aria-label={`${normalizedRating.toFixed(1)} out of 5 stars`}
            className={`inline-flex whitespace-nowrap ${className}`}
        >
            <span className="relative inline-block leading-none" aria-hidden="true">
                <span className="text-stone-300">★★★★★</span>
                <span
                    className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-orange-500"
                    style={{ width: fillWidth }}
                >
                    ★★★★★
                </span>
            </span>
        </span>
    );
}
