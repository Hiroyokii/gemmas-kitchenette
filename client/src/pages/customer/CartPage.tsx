import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useCartDrawer } from "../../hooks/useCartDrawer";

// Keep direct /cart links working while presenting the cart as a side drawer.
export default function CartPage() {
    const navigate = useNavigate();
    const { openCart } = useCartDrawer();

    useEffect(() => {
        openCart();
        navigate("/", { replace: true });
    }, [navigate, openCart]);

    return null;
}
