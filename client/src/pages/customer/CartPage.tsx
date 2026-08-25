import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../hooks/useCart";
import { createOrder } from "../../services/order.service";
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
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    async function handlePlaceOrder() {
        setError("");

        if (deliveryAddress.trim().length < 5) {
            setError("Enter a delivery address (at least 5 characters).");
            return;
        }

        setIsPlacingOrder(true);

        try {
            await createOrder({
                items: cart.map((item) => ({
                    dailyMenuId: item.menu.id,
                    quantity: item.quantity,
                })),
                deliveryAddress: deliveryAddress.trim(),
            });

            clearCart();
            navigate("/orders");
        } catch (err) {
            setError(getErrorMessage(err, "Failed to place order. Please try again."));
        } finally {
            setIsPlacingOrder(false);
        }
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

                        <Alert type="error" message={error} />

                        <Button
                            fullWidth
                            size="lg"
                            onClick={handlePlaceOrder}
                            isLoading={isPlacingOrder}
                        >
                            {isPlacingOrder
                                ? "Placing order…"
                                : `Place order — ₱${subtotal.toFixed(2)}`}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
