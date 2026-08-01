import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_LINK = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/foods", label: "Foods"},
    { to: "/admin/ingredients", label: "Ingredients"},
    { to: "/admin/recipes", label: "Recipes"},
    { to: "/admin/menu", label: "Daily Menu"},
    { to: "/admin/purchases", label: "Purchases"},
    { to: "/admin/orders", label: "Orders"},
    { to: "/admin/reports", label: "Reports"},
]

export default function AdminLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex">
            <aside className="w-56 shrink-0 border-r bg-white flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="font-bold text-lg leading-tight">
                        Gemma's Kitchenette
                    </h1>
                    <p className="text-xs text-gray-500">
                        Admin
                    </p>
                </div>

                <nav className="flex-1 p-2 space-y-1">
                    {NAV_LINK.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                             `block rounded px-3 py-2 text-sm font-medium ${
                                    isActive
                                        ? "bg-orange-600 text-white"
                                        : "text-gray-700 hover:bg-orange-50"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t text-sm">
                    <p className="mb-2 text-gray-600">
                        {user?.firstName} {user?.lastName}
                    </p>

                    <button
                        onClick={logout}
                        className="text-red-600 hover:underline"
                    >
                        Log out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}