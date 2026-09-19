import type { DailyMenu } from "../../types/DailyMenu";

import { useCart } from "../../hooks/useCart";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import StarRating from "../ui/StarRating";

interface FoodCardProps {
    menu: DailyMenu;
    compact?: boolean;
}

export default function FoodCard({
    menu,
    compact = false,
}: FoodCardProps) {
    const { cart, addToCart, decreaseQuantity } = useCart();

    const quantityInCart =
        cart.find((item) => item.menu.id === menu.id)?.quantity ?? 0;

    const isSoldOut = menu.remainingServings <= 0;

    const isLowStock =
        !isSoldOut && menu.remainingServings <= 5;

    const canIncrease =
        quantityInCart < menu.remainingServings;

    return (
        <article
            className={[
                "group flex min-w-0 flex-col overflow-hidden rounded-2xl",
                "border border-stone-200 bg-white",
                "shadow-[0_6px_20px_rgba(41,37,36,0.06)]",
                "transition-all duration-200",
                "hover:-translate-y-0.5",
                "hover:shadow-[0_12px_28px_rgba(41,37,36,0.10)]",
                compact ? "w-full" : "",
            ].join(" ")}
        >
            {/* Food Image */}
            <div
                className={[
                    "relative overflow-hidden bg-stone-100",
                    compact
                        ? "aspect-[4/3]"
                        : "m-3 aspect-[4/3] rounded-xl",
                ].join(" ")}
            >
                {menu.food.imageUrl ? (
                    <img
                        src={menu.food.imageUrl}
                        alt={menu.food.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                        <Icon
                            name="bowl"
                            className="h-16 w-16"
                        />
                    </div>
                )}

                {/* Sold Out Overlay */}
                {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/45">
                        <span className="rounded-full bg-white px-5 py-2 text-base font-extrabold uppercase tracking-wide text-stone-800 shadow-md">
                            Sold out
                        </span>
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div
                className={[
                    "flex flex-1 flex-col",
                    compact
                        ? "px-6 pb-6 pt-5"
                        : "px-7 pb-7 pt-3",
                ].join(" ")}
            >
                {/* Name + Availability */}
                <div className="flex items-start justify-between gap-3">
                    <h3
                        className={[
                            "min-w-0 flex-1 font-display font-bold leading-tight text-stone-900",
                            "line-clamp-2",
                            compact ? "text-2xl" : "text-3xl",
                        ].join(" ")}
                    >
                        {menu.food.name}
                    </h3>

                    {!isSoldOut ? (
                        <Badge
                            tone={isLowStock ? "gold" : "leaf"}
                            className="shrink-0 px-3.5 py-1.5 text-base font-bold shadow-sm"
                        >
                            {isLowStock
                                ? `${menu.remainingServings} left`
                                : "Available"}
                        </Badge>
                    ) : (
                        <span className="shrink-0 rounded-full bg-stone-100 px-3.5 py-1.5 text-base font-bold text-stone-400">
                            Sold out
                        </span>
                    )}
                </div>

                {/* Rating */}
                {menu.food.reviewCount > 0 &&
                menu.food.averageRating !== null ? (
                    <div className="mt-3 flex items-center gap-2">
                        <StarRating
                            rating={menu.food.averageRating}
                            className="text-lg"
                        />

                        <span className="text-lg font-bold text-stone-800">
                            {menu.food.averageRating.toFixed(1)}
                        </span>

                        <span className="text-base font-semibold text-stone-500">
                            ({menu.food.reviewCount} {menu.food.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                    </div>
                ) : (
                    <span className="mt-3 text-base font-semibold text-stone-400">
                        No reviews yet
                    </span>
                )}

                {/* Description */}
                <p
                    className={[
                        "mt-3 text-base leading-relaxed text-stone-600",
                        compact
                            ? "line-clamp-2 min-h-[3.5rem]"
                            : "",
                    ].join(" ")}
                >
                    {menu.food.description}
                </p>

                {/* Bottom Section */}
                <div className="mt-auto pt-6">
                    <div className="flex items-end justify-between gap-4">
                        {/* Price */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                                From
                            </p>

                            <p className="mt-0.5 font-mono text-2xl font-bold text-stone-900">
                                ₱{Number(menu.food.price).toFixed(2)}
                            </p>
                        </div>

                        {/* Add / Quantity */}
                        {quantityInCart === 0 ? (
                            <Button
                                size="sm"
                                disabled={isSoldOut}
                                onClick={() => addToCart(menu)}
                                className="h-12 w-12 rounded-xl bg-[#FFB800] p-0 text-white hover:bg-[#E6A600] active:bg-[#CC9400] disabled:bg-[#FFD966]"
                                aria-label={`Add ${menu.food.name} to cart`}
                            >
                                <Icon
                                    name="plus"
                                    className="h-6 w-6"
                                />
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        decreaseQuantity(menu.id)
                                    }
                                    aria-label={`Remove one ${menu.food.name}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-100"
                                >
                                    <Icon
                                        name="minus"
                                        className="h-5 w-5"
                                    />
                                </button>

                                <span className="w-8 text-center font-mono text-base font-bold text-stone-800">
                                    {quantityInCart}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        addToCart(menu)
                                    }
                                    disabled={!canIncrease}
                                    aria-label={`Add one ${menu.food.name}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFB800] text-white shadow-sm transition-colors hover:bg-[#E6A600] disabled:cursor-not-allowed disabled:bg-[#FFD966] disabled:opacity-60"
                                >
                                    <Icon
                                        name="plus"
                                        className="h-5 w-5"
                                    />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sold Out Message */}
                    {isSoldOut && (
                        <p className="mt-3 text-sm text-stone-400">
                            Come back tomorrow
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}