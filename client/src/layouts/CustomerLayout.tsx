import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CartDrawer from "../components/customer/CartDrawer";
import CartSummaryBar from "../components/customer/CartSummaryBar";
import { CartDrawerProvider } from "../providers/CartDrawerProvider";

export default function CustomerLayout() {
    return (
        <CartDrawerProvider>
            {/* Adjust percentage as needed: 0.9 = 90%, 0.85 = 85% */}
            <div className="min-h-screen flex flex-col [zoom:0.9]">
                <Navbar />

                <main className="flex-1 container mx-auto p-9 pb-28">
                    <Outlet />
                </main>

                <Footer />
                <CartSummaryBar />
                <CartDrawer />
            </div>
        </CartDrawerProvider>
    );
}
