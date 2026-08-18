import {
    useCallback,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { DailyMenu } from "../types/DailyMenu";
import type { CartItem } from "../types/CartItem";

import {
    CartContext,
    type CartContextValue,
} from "./CartContext";

export function CartProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = useCallback((menu: DailyMenu) => {
        if (menu.remainingServings <= 0) {
            return;
        }

        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.menu.id === menu.id
            );

            if (!existingItem) {
                return [
                    ...currentCart,
                    {
                        menu,
                        quantity: 1,
                    },
                ];
            }

            if (
                existingItem.quantity >=
                menu.remainingServings
            ) {
                return currentCart;
            }

            return currentCart.map((item) =>
                item.menu.id === menu.id
                    ? {
                          ...item,
                          menu,
                          quantity: item.quantity + 1,
                      }
                    : item
            );
        });
    }, []);

    const decreaseQuantity = useCallback(
        (dailyMenuId: number) => {
            setCart((currentCart) =>
                currentCart.flatMap((item) => {
                    if (item.menu.id !== dailyMenuId) {
                        return item;
                    }

                    return item.quantity <= 1
                        ? []
                        : {
                              ...item,
                              quantity: item.quantity - 1,
                          };
                })
            );
        },
        []
    );

    const removeFromCart = useCallback(
        (dailyMenuId: number) => {
            setCart((currentCart) =>
                currentCart.filter(
                    (item) =>
                        item.menu.id !== dailyMenuId
                )
            );
        },
        []
    );

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const itemCount = useMemo(
        () =>
            cart.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            ),
        [cart]
    );

    const subtotal = useMemo(
        () =>
            cart.reduce(
                (sum, item) =>
                    sum +
                    Number(item.menu.food.price) *
                        item.quantity,
                0
            ),
        [cart]
    );

    const value = useMemo<CartContextValue>(
        () => ({
            cart,
            itemCount,
            subtotal,
            addToCart,
            decreaseQuantity,
            removeFromCart,
            clearCart,
        }),
        [
            cart,
            itemCount,
            subtotal,
            addToCart,
            decreaseQuantity,
            removeFromCart,
            clearCart,
        ]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}