import type { CartItem } from "../../types/CartItem";
import Icon from "../ui/Icon";

interface CartItemRowProps {
    item: CartItem;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}

export default function CartItemRow({
    item,
    onIncrease,
    onDecrease,
    onRemove,
}: CartItemRowProps) {
    const subtotal = Number(item.menu.food.price) * item.quantity;
    const canIncrease = item.quantity < item.menu.remainingServings;

    return (
        <div className="flex gap-4 border-b border-ink-100 py-4 last:border-b-0">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                {item.menu.food.imageUrl ? (
                    <img
                        src={item.menu.food.imageUrl}
                        alt={item.menu.food.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-300">
                        <Icon name="bowl" className="h-6 w-6" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-medium text-ink-900">{item.menu.food.name}</p>
                    <p className="font-mono text-sm text-ink-500">
                        ₱{Number(item.menu.food.price).toFixed(2)} each
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center gap-1 rounded-lg border border-ink-200 p-1">
                        <button
                            type="button"
                            onClick={onDecrease}
                            aria-label="Decrease quantity"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100"
                        >
                            <Icon name="minus" className="h-3.5 w-3.5" />
                        </button>

                        <span className="w-6 text-center font-mono text-sm font-semibold">
                            {item.quantity}
                        </span>

                        <button
                            type="button"
                            onClick={onIncrease}
                            disabled={!canIncrease}
                            aria-label="Increase quantity"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Icon name="plus" className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <span className="w-20 shrink-0 text-right font-mono text-sm font-semibold text-ink-900">
                        ₱{subtotal.toFixed(2)}
                    </span>

                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label="Remove from cart"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <Icon name="trash" className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
