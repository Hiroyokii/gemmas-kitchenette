import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

import HomePage from "../pages/customer/HomePage";
import CartPage from "../pages/customer/CartPage";
import OrderHistoryPage from "../pages/customer/OrderHistoryPage";

import DashboardPage from "../pages/admin/DashboardPage";
import FoodsPage from "../pages/admin/FoodsPage";
import PurchasesPage from "../pages/admin/PurchasesPage";
import RecipesPage from "../pages/admin/RecipesPage";
import DailyMenuPage from "../pages/admin/DailyMenuPage";
import OrdersPage from "../pages/admin/OrdersPage";
import ReportsPage from "../pages/admin/ReportsPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/cart"
                    element={<CartPage />}
                />

                <Route
                    path="/orders"
                    element={<OrderHistoryPage />}
                />

                <Route
                    path="/admin"
                    element={<DashboardPage />}
                />

                <Route
                    path="/admin/foods"
                    element={<FoodsPage />}
                />

                <Route
                    path="/admin/purchases"
                    element={<PurchasesPage />}
                />

                <Route
                    path="/admin/recipes"
                    element={<RecipesPage />}
                />

                <Route
                    path="/admin/menu"
                    element={<DailyMenuPage />}
                />

                <Route
                    path="/admin/orders"
                    element={<OrdersPage />}
                />

                <Route
                    path="/admin/reports"
                    element={<ReportsPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}