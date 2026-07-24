import {
    createContext,
    useContext,
    useState,
} from "react";

import type { CartItem } from "../types/CartItem";
import type { DailyMenu } from "../types/DailyMenu";

interface CartContextType {

    cart: CartItem[];

    addToCart(
        menu: DailyMenu
    ): void;

    decreaseQuantity(
        dailyMenuId: number
    ): void;

    removeFromCart(
        dailyMenuId: number
    ): void;

    clearCart(): void;

}

const CartContext = createContext<CartContextType | undefined>(
    undefined
);

export function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [cart, setCart] =
        useState<CartItem[]>([]);

    function addToCart(
        menu: DailyMenu
    ) {
        
        setCart(currentCart => {
            
            const existingItem =
                currentCart.find(
                    item =>
                        item.menu.id === menu.id
            );

            if (existingItem) {
                
                return currentCart.map(item =>

                    item.menu.id === menu.id
                        ? {
                            ...item,
                            quantity:
                                item.quantity + 1,
                        }
                        : item
                );
            }

            return [

                ...currentCart,

                {
                    menu,
                    quantity: 1,
                },
                
            ];
        });
    }

    function removeFromCart(
        dailyMenuId: number
    ) {

        setCart(currentCart => 
            currentCart.filter(
                item =>
                    item.menu.id !== dailyMenuId
            )
        )
    }

    function decreaseQuantity(
        dailyMenuId: number
    ) {

        setCart(currentCart => 
            
            currentCart.flatMap(item => {

                if (
                    item.menu.id !== dailyMenuId
                ) {
                    return item;
                }

                if (
                    item.quantity === 1
                ) {
                    return [];
                }
                
                return {

                    ...item,

                    quantity:
                        item.quantity - 1,
                };
            })
        );
    }

    function clearCart() {

        setCart([]);
        
    }

    return (

        <CartContext.Provider
            value={{
                cart,
                addToCart,
                decreaseQuantity,
                removeFromCart,
                clearCart,
            }}
        >

            {children}

        </CartContext.Provider>
    )

    
}

export function useCart() {

    const context = 
        useContext(CartContext);

    if (!context) {

        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }

    return context;
}
