import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Icon from "../components/ui/Icon";

const NAV_LINKS = [
    { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/admin/foods", label: "Foods", icon: "bowl" },
    { to: "/admin/ingredients", label: "Ingredients", icon: "leaf" },
    { to: "/admin/recipes", label: "Recipes", icon: "book" },
    { to: "/admin/menu", label: "Daily Menu", icon: "calendar" },
    { to: "/admin/purchases", label: "Purchases", icon: "bag" },
    { to: "/admin/orders", label: "Orders", icon: "list" },
    { to: "/admin/reports", label: "Reports", icon: "chart" },
] as const;

const NAV_BASE =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

const NAV_ACTIVE =
    "bg-orange-500 text-white shadow-sm hover:bg-orange-600";

const NAV_INACTIVE =
    "text-stone-600 hover:bg-orange-50 hover:text-orange-700";

export default function AdminLayout() {
    const { user, logout } = useAuth();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarWidth = collapsed ? "w-20" : "w-60";

    return (
        <div className="flex min-h-screen bg-stone-50">
            {/* Mobile overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={[
                    "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-stone-200",
                    "bg-white transition-all duration-200",
                    "lg:static lg:translate-x-0",
                    sidebarWidth,
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                {/* Header */}
                <div
                    className={[
                        "flex h-16 shrink-0 items-center border-b border-stone-200",
                        collapsed ? "justify-center px-2" : "justify-between px-4",
                    ].join(" ")}
                >
                    {!collapsed && (
                        <div className="min-w-0">
                            <h1 className="truncate text-base font-bold text-stone-900">
                                Gemma's Kitchenette
                            </h1>

                            <p className="mt-0.5 text-xs font-medium text-orange-600">
                                Admin Panel
                            </p>
                        </div>
                    )}

                    {/* Desktop collapse button */}
                    <button
                        type="button"
                        onClick={() => setCollapsed((value) => !value)}
                        className="hidden rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-orange-600 lg:block"
                        aria-label={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >
                        <Icon
                            name="chevronRight"
                            className={[
                                "h-4 w-4 transition-transform",
                                collapsed ? "" : "rotate-180",
                            ].join(" ")}
                        />
                    </button>

                    {/* Mobile close button */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-orange-600 lg:hidden"
                        aria-label="Close navigation"
                    >
                        <Icon name="close" className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {NAV_LINKS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={"end" in item ? item.end : false}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                [
                                    NAV_BASE,
                                    collapsed
                                        ? "justify-center px-2"
                                        : "",
                                    isActive
                                        ? NAV_ACTIVE
                                        : NAV_INACTIVE,
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            }
                        >
                            <Icon
                                name={item.icon}
                                className="h-5 w-5 shrink-0"
                            />

                            {!collapsed && (
                                <span className="truncate">
                                    {item.label}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="shrink-0 border-t border-stone-200 p-3">
                    {!collapsed && (
                        <div className="mb-3 px-1">
                            <p className="truncate text-sm font-semibold text-stone-900">
                                {user?.firstName} {user?.lastName}
                            </p>

                            <p className="mt-0.5 text-xs text-stone-500">
                                {user?.role}
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={logout}
                        title={collapsed ? "Log out" : undefined}
                        className={[
                            "flex w-full items-center rounded-xl border border-stone-200",
                            "text-sm font-semibold text-stone-600",
                            "transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600",
                            collapsed
                                ? "justify-center px-2 py-2.5"
                                : "justify-center px-3 py-2.5",
                        ].join(" ")}
                    >
                        <Icon
                            name="logout"
                            className="h-4 w-4 shrink-0"
                        />

                        {!collapsed && (
                            <span className="ml-2">
                                Log out
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-20 flex h-16 items-center border-b border-stone-200 bg-white px-4 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-orange-600"
                        aria-label="Open navigation"
                    >
                        <Icon name="menu" className="h-5 w-5" />
                    </button>

                    <div className="ml-3">
                        <p className="text-sm font-bold text-stone-900">
                            Gemma's Kitchenette
                        </p>
                        <p className="text-xs text-orange-600">
                            Admin Panel
                        </p>
                    </div>
                </header>

                <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}