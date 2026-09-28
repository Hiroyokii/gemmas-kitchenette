import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../hooks/useCart";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import {
  createOrder,
  submitPaymentProof,
  type OrderType,
  type PaymentMethod,
} from "../../services/order.service";
import { getErrorMessage } from "../../utils/getErrorMessage";
import CartItemRow from "./CartItemRow";
import Alert from "../ui/Alert";
import Icon from "../ui/Icon";
import GcashPaymentPanel from "./GcashPaymentPanel";

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
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotError, setScreenshotError] = useState("");
  const [pendingGcashOrderId, setPendingGcashOrderId] = useState<number | null>(null);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [error, setError] = useState("");

  function finishCheckout() {
    clearCart();
    setPendingGcashOrderId(null);
    setIsCheckingOut(false);
    setPaymentMethod("COD");
    setOrderType("DELIVERY");
    setOrderNotes("");
    setPaymentScreenshot(null);
    setScreenshotError("");
    setIsRetryingPayment(false);
    setError("");
    closeCart();
    navigate("/orders");
  }

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async (order) => {
      if (paymentMethod === "GCASH") {
        try {
          await submitPaymentProof(
            order.id,
            await fileToDataUrl(paymentScreenshot!)
          );
        } catch {
          setPendingGcashOrderId(order.id);
          setError(`Order #${order.id} was placed, but payment proof could not be submitted. Check your connection and submit again to retry.`);
          return;
        }
      }
      finishCheckout();
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

  function handleClose() {
    setIsCheckingOut(false);
    setError("");
    closeCart();
  }

  async function handleCheckout() {
    setError("");
    if (paymentMethod === "GCASH" && !paymentScreenshot) {
      setError("Upload a screenshot of your successful GCash payment.");
      return;
    }
    if (pendingGcashOrderId !== null) {
      if (paymentMethod !== "GCASH" || !paymentScreenshot) {
        setError("Finish submitting the GCash payment proof for the order that was already placed.");
        return;
      }
      setIsRetryingPayment(true);
      try {
        await submitPaymentProof(
          pendingGcashOrderId,
          await fileToDataUrl(paymentScreenshot)
        );
        finishCheckout();
      } catch (err) {
        setError(getErrorMessage(err, "Payment proof could not be submitted. Please try again."));
      } finally {
        setIsRetryingPayment(false);
      }
      return;
    }
    orderMutation.mutate({
      items: cart.map((item) => ({
        dailyMenuId: item.menu.id,
        quantity: item.quantity,
      })),
      paymentMethod,
      orderType,
      notes: orderNotes.trim() || undefined,
    });
  }

  if (!isCartOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center md:items-stretch md:justify-end"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={handleClose}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isCheckingOut ? "Checkout" : "Your cart"}
        className="fixed bottom-0 flex max-h-[90dvh] w-full flex-col rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(28,25,23,0.18)] animate-[cart-drawer-mobile-in_250ms_ease-out] md:inset-y-0 md:right-0 md:h-full md:max-h-none md:max-w-lg md:rounded-none md:shadow-[-12px_0_40px_rgba(28,25,23,0.18)] md:animate-[cart-drawer-in_220ms_ease-out] lg:max-w-xl"
      >
        <header className="relative flex shrink-0 items-center justify-between border-b border-stone-100 px-5 pb-4 pt-7 md:px-8 md:py-5">
          <span className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-stone-300 md:hidden" aria-hidden="true" />
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2 md:px-8">
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
              orderType={orderType}
              notes={orderNotes}
              screenshot={paymentScreenshot}
              screenshotError={screenshotError}
              onPaymentMethodChange={setPaymentMethod}
              onOrderTypeChange={setOrderType}
              onNotesChange={setOrderNotes}
              onScreenshotChange={(file, fileError) => {
                setPaymentScreenshot(file);
                setScreenshotError(fileError);
              }}
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
          <footer className="shrink-0 border-t border-stone-200 bg-white px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:px-8 md:pb-5">
            <div className="mb-4 flex items-center justify-between text-base font-semibold text-stone-800">
              <span>
                Subtotal
              </span>
              <span className="font-display text-xl font-bold">
                ₱{subtotal.toFixed(2)}
              </span>
            </div>
            <p className="mb-4 text-xs leading-5 text-stone-500">
              {itemCount} item{itemCount === 1 ? "" : "s"} · Delivery fees, if any, are confirmed at checkout.
            </p>
            <Alert type="error" message={error} />
            {isCheckingOut ? (
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={orderMutation.isPending || isRetryingPayment}
                  className="h-13 rounded-xl bg-[#FFB800] px-5 font-bold text-stone-900 transition hover:bg-[#e6a600] disabled:opacity-60"
                >
                  {orderMutation.isPending || isRetryingPayment
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
  orderType: OrderType;
  notes: string;
  screenshot: File | null;
  screenshotError: string;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onOrderTypeChange: (value: OrderType) => void;
  onNotesChange: (value: string) => void;
  onScreenshotChange: (file: File | null, error: string) => void;
  onIncrease: ReturnType<typeof useCart>["addToCart"];
  onDecrease: ReturnType<typeof useCart>["decreaseQuantity"];
};

function CheckoutForm({
  cart,
  subtotal,
  paymentMethod,
  orderType,
  notes,
  screenshot,
  screenshotError,
  onPaymentMethodChange,
  onOrderTypeChange,
  onNotesChange,
  onScreenshotChange,
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
        <h3 className="font-display text-lg text-stone-900">Order type</h3>
        <div className="mt-3">
          <select
            id="drawer-order-type"
            value={orderType}
            onChange={(e) =>
              onOrderTypeChange(e.target.value as "DELIVERY" | "PICKUP")
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20"
          >
            <option value="DELIVERY">Delivery</option>
            <option value="PICKUP">Pickup</option>
          </select>
        </div>
        <label htmlFor="drawer-order-notes" className="mb-1.5 mt-4 block text-lg font-display text-stone-900">Order notes <span className="font-normal text-stone-500">(optional)</span></label>
        <textarea id="drawer-order-notes" value={notes} onChange={(event) => onNotesChange(event.target.value)} maxLength={500} rows={3} placeholder="Add a note for the kitchen or store" className="w-full resize-y rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20" />

        <h3 className="mt-6 font-display text-lg text-stone-900">Payment method</h3>
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
                Pay by GCash and upload your payment screenshot.
              </small>
            </span>
          </label>
        </div>
        {paymentMethod === "GCASH" && (
          <GcashPaymentPanel
            amount={subtotal}
            screenshot={screenshot}
            fileError={screenshotError}
            onScreenshotChange={onScreenshotChange}
          />
        )}
        <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-500">
          {orderType === "DELIVERY" ? "Your saved delivery address and contact details will be used for this order." : "This order is for pickup at the store."} The final total is{" "}
          <strong className="font-display text-stone-700">
            ₱{subtotal.toFixed(2)}
          </strong>
          .
        </p>
      </section>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the payment screenshot."));
    };
    reader.onerror = () => reject(new Error("Could not read the payment screenshot."));
    reader.readAsDataURL(file);
  });
}
