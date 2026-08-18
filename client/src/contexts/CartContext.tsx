import {
    createContext,
    useContext,
} from "react";

import type { CartItem } from "../types/CartItem";
import type { DailyMenu } from "../types/DailyMenu";

export interface CartContextValue {
    cart: CartItem[];
    itemCount: number;
    subtotal: number;

    addToCart: (
        menu: DailyMenu
    ) => void;

    decreaseQuantity: (
        dailyMenuId: number
    ) => void;

    removeFromCart: (
        dailyMenuId: number
    ) => void;

    clearCart: () => void;
}

export const CartContext =
    createContext<CartContextValue | undefined>(undefined);

export function useCart(): CartContextValue {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }

    return context;
}