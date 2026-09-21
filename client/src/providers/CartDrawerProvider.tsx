import { useCallback, useMemo, useState, type ReactNode } from "react";

import { CartDrawerContext } from "../contexts/CartDrawerContext";

export function CartDrawerProvider({ children }: { children: ReactNode }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);
    const value = useMemo(() => ({ isCartOpen, openCart, closeCart }), [isCartOpen, openCart, closeCart]);

    return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}
