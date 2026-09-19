import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function CustomerLayout() {
    return (
        /* Adjust percentage as needed: 0.9 = 90%, 0.85 = 85% */
        <div className="min-h-screen flex flex-col [zoom:0.9]">
            <Navbar />

            <main className="flex-1 container mx-auto p-9">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}