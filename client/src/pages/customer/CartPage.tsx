import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../contexts/CartContext";
import { createOrder } from "../../services/order.service";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function CartPage() {
    const {
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
    } = useCart();

    const navigate = useNavigate();

    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    const total =
        cart.reduce(

            (sum, item) =>

                sum +

                item.menu.food.price *
                item.quantity,

            0

        )

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
            setError(
                getErrorMessage(
                    err,
                    "Failed to place order. Please try again."
                )
            );
        } finally {
            setIsPlacingOrder(false);
        }
    }

    if (cart.length === 0) {

        return (
            <p>
                Your cart is empty.
            </p>
        );
    }

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                My Cart
            </h1>

            {cart.map(item => (

                <div
                    key={item.menu.id}
                    className="border rounded p-4"
                >
                    
                    <h2 className="font-semibold">
                        {item.menu.food.name}
                    </h2>

                    <p>
                        ₱{item.menu.food.price}
                    </p>

                    <p>
                        Quantity:
                        {" "}
                        {item.quantity}
                    </p>

                    <p>
                        Subtotal:
                        {" "}
                        ₱
                        {
                            item.menu.food.price *
                            item.quantity
                        }
                    </p>

                    <div className="flex gap-2 mt-3">

                        <button
                            onClick={() => 
                                decreaseQuantity(
                                    item.menu.id
                                )
                            }
                            className="border rounded px-3 py-1"
                        >
                            -
                        </button>

                        <button
                            onClick={() => 
                                addToCart(
                                    item.menu
                                )
                            }
                            disabled={
                                item.quantity >= item.menu.remainingServings
                            }
                            className="border rounded px-3 py-1 disabled:opacity-40"
                        >
                            +
                        </button>

                        <button
                            onClick={() => 
                                removeFromCart(
                                    item.menu.id
                                )
                            }
                            className="text-red-600 hover:underline"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            ))}

            <div className="text-right">

                <h2 className="text-2xl font-bold">

                    total:

                    ₱{total}

                </h2>

            </div>

            <div className="border-t pt-4 space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Delivery address
                    </label>
                    <input
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Block, Lot, Street, Landmark..."
                        className="border rounded w-full p-2"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full rounded bg-orange-600 py-2 text-white font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                    {isPlacingOrder ? "Placing order..." : "Place Order"}
                </button>
            </div>

        </div>
    );
}
