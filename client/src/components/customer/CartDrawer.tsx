import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../hooks/useCart";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import {
  createOrder,
  submitPaymentReference,
  type PaymentMethod,
} from "../../services/order.service";
import { getErrorMessage } from "../../utils/getErrorMessage";
import CartItemRow from "./CartItemRow";
import Alert from "../ui/Alert";
import Icon from "../ui/Icon";

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useCartDrawer();
  const {
    cart,
    itemCount,
    subtotal,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async (order) => {
      clearCart();
      if (paymentMethod === "GCASH" && referenceNumber.trim()) {
        try {
          await submitPaymentReference(order.id, referenceNumber.trim());
        } catch {
          // The order itself was placed; a reference can be resubmitted from My Orders.
        }
      }
      closeCart();
      navigate("/orders");
    },
    onError: (err) =>
      setError(
        getErrorMessage(err, "Failed to place order. Please try again.")
      ),
  });

  useEffect(() => {
    if (!isCartOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [closeCart, isCartOpen]);

  useEffect(() => {
    if (cart.length === 0) setIsCheckingOut(false);
  }, [cart.length]);

  function handleClose() {
    setIsCheckingOut(false);
    setError("");
    closeCart();
  }

  function handleCheckout() {
    setError("");
    if (paymentMethod === "GCASH" && referenceNumber.trim().length < 4) {
      setError("Enter your GCash reference number to place this order.");
      return;
    }
    orderMutation.mutate({
      items: cart.map((item) => ({
        dailyMenuId: item.menu.id,
        quantity: item.quantity,
      })),
      paymentMethod,
    });
  }

  if (!isCartOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex justify-end"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={handleClose}
        className="absolute inset-0 cursor-default bg-stone-950/45 backdrop-blur-[1px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isCheckingOut ? "Checkout" : "Your cart"}
        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-[-12px_0_40px_rgba(28,25,23,0.18)] animate-[cart-drawer-in_220ms_ease-out]"
      >
        <header className="flex items-center justify-between border-b border-stone-100 px-5 py-5 sm:px-8">
          <div>
            <h2 className="mt-1 font-display text-2xl font-bold text-stone-900">
              {isCheckingOut ? "Checkout" : "Your Cart"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-700 transition hover:bg-stone-50"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-8">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFB800]/15 text-[#FFB800]">
                <Icon name="cart" className="h-8 w-8" />
              </div>
              <h3 className="mt-5 font-display text-xl text-stone-900">
                Your cart is empty
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">
                Pick something delicious from the menu to start an order.
              </p>
            </div>
          ) : isCheckingOut ? (
            <CheckoutForm
              cart={cart}
              subtotal={subtotal}
              paymentMethod={paymentMethod}
              referenceNumber={referenceNumber}
              onPaymentMethodChange={setPaymentMethod}
              onReferenceNumberChange={setReferenceNumber}
              onIncrease={addToCart}
              onDecrease={decreaseQuantity}
            />
          ) : (
            <div className="divide-y divide-stone-100">
              {cart.map((item) => (
                <CartItemRow
                  key={item.menu.id}
                  item={item}
                  onIncrease={() => addToCart(item.menu)}
                  onDecrease={() => decreaseQuantity(item.menu.id)}
                  onRemove={() => removeFromCart(item.menu.id)}
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="border-t border-stone-200 bg-white px-5 py-5 sm:px-8">
            <div className="mb-4 flex items-center justify-between text-base font-semibold text-stone-800">
              <span>
                Subtotal · {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
              <span className="font-mono text-xl font-bold">
                ₱{subtotal.toFixed(2)}
              </span>
            </div>
            <Alert type="error" message={error} />
            {isCheckingOut ? (
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={orderMutation.isPending}
                  className="h-13 rounded-xl bg-[#FFB800] px-5 font-bold text-stone-900 transition hover:bg-[#e6a600] disabled:opacity-60"
                >
                  {orderMutation.isPending
                    ? "Placing order…"
                    : `Place order · ₱${subtotal.toFixed(2)}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckingOut(false);
                    setError("");
                  }}
                  className="h-12 rounded-xl border border-stone-200 font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Back to Cart
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCheckingOut(true)}
                className="h-13 w-full rounded-xl bg-[#FFB800] px-5 font-bold text-stone-900 transition hover:bg-[#e6a600]"
              >
                Continue to Checkout
              </button>
            )}
          </footer>
        )}
      </aside>
    </div>,
    document.body
  );
}

type CheckoutFormProps = {
  cart: ReturnType<typeof useCart>["cart"];
  subtotal: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onReferenceNumberChange: (value: string) => void;
  onIncrease: ReturnType<typeof useCart>["addToCart"];
  onDecrease: ReturnType<typeof useCart>["decreaseQuantity"];
};

function CheckoutForm({
  cart,
  subtotal,
  paymentMethod,
  referenceNumber,
  onPaymentMethodChange,
  onReferenceNumberChange,
  onIncrease,
  onDecrease,
}: CheckoutFormProps) {
  return (
    <div className="pb-6">
      <div className="divide-y divide-stone-100">
        {cart.map((item) => (
          <CartItemRow
            key={item.menu.id}
            item={item}
            onIncrease={() => onIncrease(item.menu)}
            onDecrease={() => onDecrease(item.menu.id)}
          />
        ))}
      </div>
      <section className="mt-6 border-t border-stone-200 pt-6">
        <h3 className="font-display text-lg text-stone-900">Payment method</h3>
        <div className="mt-3 grid gap-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
              paymentMethod === "COD"
                ? "border-[#FFB800] bg-[#FFB800]/10"
                : "border-stone-200"
            }`}
          >
            <input
              type="radio"
              name="drawer-payment"
              checked={paymentMethod === "COD"}
              onChange={() => onPaymentMethodChange("COD")}
              className="mt-1 accent-[#FFB800]"
            />
            <span>
              <strong className="text-sm text-stone-900">
                Cash on Delivery
              </strong>
              <small className="mt-1 block text-sm text-stone-500">
                Pay when your order arrives.
              </small>
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
              paymentMethod === "GCASH"
                ? "border-[#FFB800] bg-[#FFB800]/10"
                : "border-stone-200"
            }`}
          >
            <input
              type="radio"
              name="drawer-payment"
              checked={paymentMethod === "GCASH"}
              onChange={() => onPaymentMethodChange("GCASH")}
              className="mt-1 accent-[#FFB800]"
            />
            <span>
              <strong className="text-sm text-stone-900">
                GCash — simulated
              </strong>
              <small className="mt-1 block text-sm text-stone-500">
                Enter your payment reference before placing the order.
              </small>
            </span>
          </label>
        </div>
        {paymentMethod === "GCASH" && (
          <div className="mt-4">
            <label
              htmlFor="drawer-gcash-reference"
              className="mb-1.5 block text-sm font-semibold text-stone-800"
            >
              GCash reference number
            </label>
            <input
              id="drawer-gcash-reference"
              value={referenceNumber}
              onChange={(event) =>
                onReferenceNumberChange(event.target.value)
              }
              placeholder="e.g. 1234 5678 9012"
              className="h-11 w-full rounded-xl border border-stone-200 px-3 text-sm outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20"
            />
          </div>
        )}
        <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-500">
          Your saved delivery address and contact details will be used for this
          order. The final total is{" "}
          <strong className="font-mono text-stone-700">
            ₱{subtotal.toFixed(2)}
          </strong>
          .
        </p>
      </section>
    </div>
  );
}