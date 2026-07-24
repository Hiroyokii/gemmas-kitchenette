import { useCart } from "../../contexts/CartContext";

export default function CartPage() {
    
    console.log("CartPage rendered");

    const {
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
    } = useCart();

    const total =
        cart.reduce(

            (sum, item) =>

                sum +

                item.menu.food.price *
                item.quantity,

            0

        )

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
                        >
                            -
                        </button>

                        <button
                            onClick={() => 
                                addToCart(
                                    item.menu
                                )
                            }
                        >
                            +
                        </button>

                        <button
                            onClick={() => 
                                removeFromCart(
                                    item.menu.id
                                )
                            }
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

        </div>
    );
}