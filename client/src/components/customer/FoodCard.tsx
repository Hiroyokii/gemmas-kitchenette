import type { DailyMenu } from "../../types/DailyMenu";
import { useCart } from "../../hooks/useCart";
import Icon from "../ui/Icon";
import Badge from "../ui/Badge";

interface FoodCardProps {
    menu: DailyMenu;
}

export default function FoodCard({ menu }: FoodCardProps) {
    const { cart, addToCart, decreaseQuantity } = useCart();

    const quantityInCart = cart.find((item) => item.menu.id === menu.id)?.quantity ?? 0;

    const isSoldOut = menu.remainingServings <= 0;
    const isLowStock = !isSoldOut && menu.remainingServings <= 5;
    const canIncrease = quantityInCart < menu.remainingServings;

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]">
            <div className="relative aspect-[4/3] w-full bg-ink-100">
                {menu.food.imageUrl ? (
                    <img
                        src={menu.food.imageUrl}
                        alt={menu.food.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-300">
                        <Icon name="bowl" className="h-10 w-10" />
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink-900/50">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-800">
                            Sold out
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight text-ink-900">
                        {menu.food.name}
                    </h3>
                    <span className="shrink-0 font-mono text-base font-semibold text-brand-600">
                        ₱{Number(menu.food.price).toFixed(2)}
                    </span>
                </div>

                <p className="line-clamp-2 text-sm text-ink-500">{menu.food.description}</p>

                <div className="mt-auto flex items-center justify-between pt-3">
                    {!isSoldOut ? (
                        <Badge tone={isLowStock ? "gold" : "leaf"}>
                            {menu.remainingServings} left
                        </Badge>
                    ) : (
                        <span />
                    )}

                    {quantityInCart === 0 ? (
                        <button
                            type="button"
                            onClick={() => addToCart(menu)}
                            disabled={isSoldOut}
                            className="rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-400"
                        >
                            Add to cart
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1">
                            <button
                                type="button"
                                onClick={() => decreaseQuantity(menu.id)}
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-ink-700 shadow-sm transition-colors hover:bg-ink-100"
                            >
                                <Icon name="minus" className="h-3.5 w-3.5" />
                            </button>

                            <span className="w-6 text-center font-mono text-sm font-semibold">
                                {quantityInCart}
                            </span>

                            <button
                                type="button"
                                onClick={() => addToCart(menu)}
                                disabled={!canIncrease}
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-ink-700 shadow-sm transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Icon name="plus" className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
