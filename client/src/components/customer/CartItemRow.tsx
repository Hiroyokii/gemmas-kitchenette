import type { CartItem } from "../../types/CartItem";
import Icon from "../ui/Icon";

interface CartItemRowProps {
    item: CartItem;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove?: () => void;
}

export default function CartItemRow({
    item,
    onIncrease,
    onDecrease,
}: CartItemRowProps) {
    const canIncrease = item.quantity < item.menu.remainingServings;

    return (
        <div className="flex items-center gap-3 border-b border-stone-200 py-4 last:border-b-0">
            {/* Food Image */}
            <div className="h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {item.menu.food.imageUrl ? (
                    <img
                        src={item.menu.food.imageUrl}
                        alt={item.menu.food.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                        <Icon name="bowl" className="h-6 w-6" />
                    </div>
                )}
            </div>

            {/* Food Info */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5 text-stone-900">
                    {item.menu.food.name}
                </p>

                <p className="text-sm font-semibold text-stone-900">
                    ₱{Number(item.menu.food.price).toFixed(2)}
                </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={onDecrease}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-50"
                >
                    <Icon name="minus" className="h-4 w-4" />
                </button>

                <span className="w-4 text-center text-sm font-medium text-stone-700">
                    {item.quantity}
                </span>

                <button
                    type="button"
                    onClick={onIncrease}
                    disabled={!canIncrease}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Icon name="plus" className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}