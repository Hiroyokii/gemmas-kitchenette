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
import IngredientsPage from "../pages/admin/IngredientsPage";
import PurchasesPage from "../pages/admin/PurchasesPage";
import RecipesPage from "../pages/admin/RecipesPage";
import DailyMenuPage from "../pages/admin/DailyMenuPage";
import OrdersPage from "../pages/admin/OrdersPage";
import ReportsPage from "../pages/admin/ReportsPage";

import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<PublicRoute />}>

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />

                </Route>

                <Route
                    path="/"
                    element={<CustomerLayout />}
                >
                    <Route
                        index
                        element={<HomePage />}
                    />

                    <Route
                        element={
                            <ProtectedRoute
                                roles={["CUSTOMER"]}
                            />
                        }
                    >
                        <Route
                            path="cart"
                            element={<CartPage />}
                        />

                        <Route
                            path="orders"
                            element={<OrderHistoryPage />}
                        />
                    </Route>
                </Route>

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            roles={["ADMIN", "STAFF"]}
                        />
                    }
                >
                    <Route element={<AdminLayout />}>
                        <Route
                            index
                            element={<DashboardPage />}
                        />

                        <Route
                            path="foods"
                            element={<FoodsPage />}
                        />

                        <Route
                            path="ingredients"
                            element={<IngredientsPage />}
                        />

                        <Route
                            path="purchases"
                            element={<PurchasesPage />}
                        />

                        <Route
                            path="recipes"
                            element={<RecipesPage />}
                        />

                        <Route
                            path="menu"
                            element={<DailyMenuPage />}
                        />

                        <Route
                            path="orders"
                            element={<OrdersPage />}
                        />

                        <Route
                            path="reports"
                            element={<ReportsPage />}
                        />
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}