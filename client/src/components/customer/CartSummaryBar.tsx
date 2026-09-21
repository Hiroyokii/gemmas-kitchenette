import { useCart } from "../../hooks/useCart";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import Icon from "../ui/Icon";

export default function CartSummaryBar() {
  const { itemCount, subtotal } = useCart();
  const { isCartOpen, openCart } = useCartDrawer();

  if (itemCount === 0 || isCartOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6">
      <button
        type="button"
        onClick={openCart}
        className="mx-auto flex w-full max-w-xl items-center gap-4 rounded-2xl bg-[#FFB800] px-5 py-4 text-left text-white shadow-[0_16px_36px_rgba(194,65,12,0.34)] transition transition hover:bg-[#E6A600]  sm:px-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon name="cart" className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <strong>
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </strong>
          <span className="text-sm text-orange-100">View cart</span>
        </span>
        <span className="flex items-center gap-2 font-mono text-lg font-bold">
          ₱{subtotal.toFixed(2)}
          <Icon name="chevronRight" className="h-5 w-5" />
        </span>
      </button>
    </div>
  );
}