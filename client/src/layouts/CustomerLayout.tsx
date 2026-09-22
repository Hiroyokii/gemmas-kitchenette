import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CartDrawer from "../components/customer/CartDrawer";
import CartSummaryBar from "../components/customer/CartSummaryBar";
import { CartDrawerProvider } from "../providers/CartDrawerProvider";

export default function CustomerLayout() {
    return (
        <CartDrawerProvider>
            <div className="min-h-screen flex flex-col">
                <Navbar />

                <main className="container mx-auto flex-1 px-4 py-6 pb-28 md:px-6 md:py-8 lg:px-9 lg:py-10">
                    <Outlet />
                </main>

                <Footer />
                <CartSummaryBar />
                <CartDrawer />
            </div>
        </CartDrawerProvider>
    );
}
