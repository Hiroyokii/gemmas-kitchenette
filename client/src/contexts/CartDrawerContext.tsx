import { createContext } from "react";

export interface CartDrawerContextValue {
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

export const CartDrawerContext =
    createContext<CartDrawerContextValue | undefined>(undefined);
