import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { useCart } from "../../hooks/useCart";
import { createOrder, submitPaymentReference, type PaymentMethod } from "../../services/order.service";
import { getErrorMessage } from "../../utils/getErrorMessage";

import CartItemRow from "../../components/customer/CartItemRow";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";

export default function CartPage() {
    const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart, subtotal } =
        useCart();

    const navigate = useNavigate();

    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [error, setError] = useState("");

    const orderMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: async (order) => {
            clearCart();
            if (paymentMethod === "GCASH") {
                try {
                    await submitPaymentReference(order.id, referenceNumber.trim());
                } catch {
                    // The order was created successfully. The customer can resubmit a reference from My Orders.
                }
            }
            navigate("/orders");
        },
        onError: (err) => setError(getErrorMessage(err, "Failed to place order. Please try again.")),
    });

    async function handlePlaceOrder() {
        setError("");

        if (deliveryAddress.trim().length < 5) {
            setError("Enter a delivery address (at least 5 characters).");
            return;
        }

        if (paymentMethod === "GCASH" && referenceNumber.trim().length < 4) {
            setError("Enter the GCash reference number from your simulated payment.");
            return;
        }

        orderMutation.mutate({
            items: cart.map((item) => ({ dailyMenuId: item.menu.id, quantity: item.quantity })),
            deliveryAddress: deliveryAddress.trim(),
            paymentMethod,
        });
    }

    if (cart.length === 0) {
        return (
            <div>
                <PageHeader title="My Cart" />
                <EmptyState
                    icon={<Icon name="cart" className="h-6 w-6" />}
                    title="Your cart is empty"
                    description="Add something from today's menu to get started."
                    action={
                        <Button variant="secondary" onClick={() => navigate("/")}>
                            Browse the menu
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="My Cart"
                description={`${cart.length} item${cart.length === 1 ? "" : "s"}`}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="p-4 sm:p-5 lg:col-span-2">
                    {cart.map((item) => (
                        <CartItemRow
                            key={item.menu.id}
                            item={item}
                            onIncrease={() => addToCart(item.menu)}
                            onDecrease={() => decreaseQuantity(item.menu.id)}
                            onRemove={() => removeFromCart(item.menu.id)}
                        />
                    ))}
                </Card>

                <div className="lg:sticky lg:top-24 lg:h-fit">
                    <Card className="space-y-4 p-5">
                        <h2 className="font-display text-lg font-semibold text-ink-900">
                            Order summary
                        </h2>

                        <div className="flex items-center justify-between text-sm text-ink-600">
                            <span>Subtotal</span>
                            <span className="font-mono font-semibold text-ink-900">
                                ₱{subtotal.toFixed(2)}
                            </span>
                        </div>

                        <Textarea
                            label="Delivery address"
                            placeholder="Block, Lot, Street, Landmark…"
                            rows={3}
                            value={deliveryAddress}
                            onChange={(event) => setDeliveryAddress(event.target.value)}
                        />

                        <fieldset className="space-y-2">
                            <legend className="text-sm font-medium text-ink-800">Payment method</legend>
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3 text-sm text-ink-700">
                                <input type="radio" name="paymentMethod" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="mt-0.5" />
                                <span><strong>Cash on Delivery</strong><br /><span className="text-xs text-ink-500">Pay when your order arrives.</span></span>
                            </label>
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-orange-200 bg-orange-50/40 p-3 text-sm text-ink-700">
                                <input type="radio" name="paymentMethod" checked={paymentMethod === "GCASH"} onChange={() => setPaymentMethod("GCASH")} className="mt-0.5" />
                                <span><strong>GCash — simulated</strong><br /><span className="text-xs text-ink-500">Staff must verify your reference before confirming the order.</span></span>
                            </label>
                        </fieldset>

                        {paymentMethod === "GCASH" && (
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                                <p className="text-sm font-semibold text-orange-900">Simulated GCash payment</p>
                                <div className="mt-3 flex items-center gap-4"><div aria-label="Simulated GCash QR code" className="grid h-24 w-24 grid-cols-6 gap-1 rounded bg-white p-2 shadow-sm">{Array.from({ length: 36 }, (_, index) => <span key={index} className={index % 3 === 0 || index % 7 === 0 || [1, 8, 22, 30].includes(index) ? "bg-ink-900" : "bg-white"} />)}</div><p className="text-xs leading-5 text-ink-600">This is a capstone simulation only. Pretend to scan the code, then enter the reference number shown by your simulated payment.</p></div>
                                <div className="mt-3"><label htmlFor="gcash-reference" className="mb-1 block text-sm font-medium text-ink-800">GCash reference number</label><input id="gcash-reference" value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} placeholder="e.g. 1234 5678 9012" className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" /></div>
                            </div>
                        )}

                        <Alert type="error" message={error} />

                        <Button
                            fullWidth
                            size="lg"
                            onClick={handlePlaceOrder}
                            isLoading={orderMutation.isPending}
                        >
                            {orderMutation.isPending
                                ? "Placing order…"
                                : `Place order — ₱${subtotal.toFixed(2)}`}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
