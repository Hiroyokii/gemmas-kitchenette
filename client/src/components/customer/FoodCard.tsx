import type { DailyMenu } from "../../types/DailyMenu";

import { useCart } from "../../hooks/useCart";

import Button from "../ui/Button";
import Icon from "../ui/Icon";
import StarRating from "../ui/StarRating";

interface FoodCardProps {
    menu: DailyMenu;
}

export default function FoodCard({ menu }: FoodCardProps) {
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
                "group flex min-w-0 w-full flex-col overflow-hidden rounded-2xl",
                "border border-stone-200 bg-white",
                "shadow-[0_6px_20px_rgba(41,37,36,0.06)]",
                "transition-all duration-200",
                "hover:-translate-y-0.5",
                "hover:shadow-[0_12px_28px_rgba(41,37,36,0.10)]",
            ].join(" ")}
        >

            {/* Food Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
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

                {/* Availability */}
                {!isSoldOut && (
                    <span
                        className={[
                            "absolute right-2 top-2 rounded-full px-2.5 py-1",
                            "text-[10px] font-display shadow-sm backdrop-blur-sm",
                            "md:right-3 md:top-3 md:px-3 md:py-1.5 md:text-sm",
                            isLowStock
                                ? "bg-[#FFB800] text-white"
                                : "bg-white/95 text-stone-800",
                        ].join(" ")}
                    >
                        {isLowStock
                            ? `${menu.remainingServings} left`
                            : "Available"}
                    </span>
                )}

                {/* Sold Out */}
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
                    "flex min-w-0 flex-1 flex-col p-3 md:p-4 lg:p-5",
                ].join(" ")}
            >
                {/* Food Name */}
                <h3
                    className={[
                        "font-display font-bold leading-tight text-stone-900",
                        "min-w-0 min-h-[1rem] line-clamp-2 text-base md:text-lg lg:text-xl",
                    ].join(" ")}
                >
                    {menu.food.name}
                </h3>

                {/* Rating */}
                {menu.food.reviewCount > 0 &&
                menu.food.averageRating !== null ? (
                    <div className="mt-1.5 flex min-h-4 min-w-0 items-center gap-1 md:mt-2 md:min-h-5 md:gap-1.5">
                        <StarRating
                            rating={menu.food.averageRating}
                            className="text-xs md:text-sm"
                        />

                        <span className="text-xs font-bold text-stone-800 md:text-sm">
                            {menu.food.averageRating.toFixed(1)}
                        </span>

                        <span className="text-xs text-stone-400">
                            ({menu.food.reviewCount})
                        </span>
                    </div>
                ) : (
                    <span className="mt-1.5 flex min-h-4 items-center text-xs font-medium text-stone-400 md:mt-2 md:min-h-5 md:text-sm">
                        No reviews yet
                    </span>
                )}

                {/* Description */}
                <p
                    className="mt-2 min-h-[2.5rem] line-clamp-2 text-xs leading-5 text-stone-600 md:text-sm md:leading-relaxed"
                >
                    {menu.food.description}
                </p>

                {/* Bottom Section */}
                <div className="mt-auto pt-3 md:pt-4">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                        {/* Price */}
                        <div>
                            <p className="hidden text-xs font-semibold uppercase tracking-wider text-stone-400 md:block">
                                From
                            </p>

                            <p className="font-mono text-base font-bold text-black md:text-lg lg:mt-0.5 lg:text-xl">
                                ₱{Number(menu.food.price).toFixed(2)}
                            </p>
                        </div>

                        {/* Add / Quantity */}
                        {quantityInCart === 0 ? (
                            <Button
                                size="sm"
                                disabled={isSoldOut}
                                onClick={() => addToCart(menu)}
                                className="h-9 w-18 shrink-0 rounded-lg bg-[#FFB800] p-0 text-stone-900 hover:bg-[#E6A600] active:bg-[#CC9400] disabled:bg-[#FFD966] md:h-9 md:w-20 lg:h-10 lg:w-22 lg:rounded-xl"
                                aria-label={`Add ${menu.food.name} to cart`}
                            >
                                <p className="flex-1 text-sm font-display font-bold leading-tight text-white">
                                    Add
                                </p>

                                <Icon
                                    name="plus"
                                    className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5"
                                />
                            </Button>
                        ) : (
                            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1 md:gap-1.5 lg:gap-2 lg:rounded-xl lg:p-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        decreaseQuantity(menu.id)
                                    }
                                    aria-label={`Remove one ${menu.food.name}`}
                                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-stone-700 shadow-sm transition-colors hover:bg-stone-100 lg:h-8 lg:w-8 lg:rounded-lg"
                                >
                                    <Icon
                                        name="minus"
                                        className="h-3.5 w-3.5 lg:h-4 lg:w-4"
                                    />
                                </button>

                                <span className="w-4 text-center font-mono text-xs font-bold text-stone-800 lg:w-6 lg:text-sm">
                                    {quantityInCart}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => addToCart(menu)}
                                    disabled={!canIncrease}
                                    aria-label={`Add one ${menu.food.name}`}
                                    className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FFB800] text-stone-900 shadow-sm transition-colors hover:bg-[#E6A600] disabled:cursor-not-allowed disabled:bg-[#FFD966] disabled:opacity-60 lg:h-8 lg:w-8 lg:rounded-lg"
                                >
                                    <Icon
                                        name="plus"
                                        className="h-3.5 w-3.5 lg:h-4 lg:w-4"
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
