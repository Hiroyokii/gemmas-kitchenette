import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CustomerLayout() {
    return (
        <div className="min-h-screen flex flex-col">

            <Navbar />

            <main className="flex-1 container mx-auto p-6">

                <Outlet />

            </main>

            <Footer />

        </div>
    );
}