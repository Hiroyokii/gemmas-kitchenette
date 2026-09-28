import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import Icon from "../components/ui/Icon";

const NAV_SECTIONS = [
    { title: "Workspace", links: [
        { to: "/admin", label: "Overview", icon: "dashboard", end: true },
        { to: "/admin/orders", label: "Orders", icon: "list" },
    ] },
    { title: "Kitchen", links: [
        { to: "/admin/menu", label: "Daily menu", icon: "calendar" },
        { to: "/admin/foods", label: "Food catalog", icon: "bowl" },
        { to: "/admin/recipes", label: "Recipes", icon: "book" },
    ] },
    { title: "Inventory", links: [
        { to: "/admin/ingredients", label: "Ingredients", icon: "leaf" },
        { to: "/admin/purchases", label: "Purchases", icon: "bag" },
        { to: "/admin/spoilage", label: "Spoilage", icon: "bag" },
    ] },
] as const;

const NAV_BASE =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

const NAV_ACTIVE =
    "bg-[#FFB800] text-stone-950 shadow-sm hover:bg-[#e5a500]";

const NAV_INACTIVE =
    "text-stone-600 hover:bg-amber-50 hover:text-stone-950";

export default function AdminLayout() {
    const { user, logout } = useAuth();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#f7f7f5]">
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
                    "fixed inset-y-0 left-0 z-40 flex flex-col",
                    "bg-white transition-all duration-200",
                    "md:sticky md:top-0 md:h-screen md:translate-x-0",
                    "w-60 md:w-20",
                    collapsed ? "lg:w-20" : "lg:w-60",
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                {/* Header */}
                <div
                    className={[
                        "flex h-22 shrink-0 items-center border-b border-stone-200",
                        "justify-between px-4 md:justify-center md:px-2 lg:justify-between lg:px-4",
                    ].join(" ")}
                >
                    <Link
                        to="/admin"
                        aria-label="Gemma's Kitchenette admin home"
                        className={`min-w-0 items-center ${collapsed ? "hidden" : "hidden lg:flex"}`}
                    >
                        <img
                            src="/gemmas-logo2.png"
                            alt="Gemma's Kitchenette"
                            className={`h-auto object-contain ${collapsed ? "w-10" : "w-36"}`}
                        />
                    </Link>

                    {/* Desktop collapse button */}
                    <button
                        type="button"
                        onClick={() => setCollapsed((value) => !value)}
                        className="hidden rounded-lg p-2 text-stone-500 transition-colors hover:bg-amber-50 hover:text-[#8f6500] lg:block"
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
                        className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-[#8f6500] md:hidden"
                        aria-label="Close navigation"
                    >
                        <Icon name="close" className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-5 overflow-y-auto p-2 lg:p-3">
                    {NAV_SECTIONS.map((section) => <section key={section.title}>
                        <p className={`mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400 ${collapsed ? "lg:hidden" : "lg:block"}`}>{section.title}</p>
                        <div className="space-y-1">{section.links.map((item) => (
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
                                        : "justify-center px-2 lg:justify-start lg:px-3",
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

                            <span className={`hidden truncate ${collapsed ? "" : "lg:inline"}`}>
                                    {item.label}
                            </span>
                        </NavLink>
                    ))}</div>
                    </section>)}
                </nav>

                {/* User section */}
                <div className="shrink-0 border-t border-stone-200 p-2 lg:p-3">
                    <div className={`mb-3 px-1 ${collapsed ? "hidden" : "md:hidden lg:block"}`}>
                            <p className="truncate text-sm font-semibold text-stone-900">
                                {user?.firstName} {user?.lastName}
                            </p>

                            <p className="mt-0.5 text-xs text-stone-500">
                                {user?.role}
                            </p>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        title={collapsed ? "Log out" : undefined}
                        className={[
                            "flex w-full items-center justify-center rounded-xl border border-stone-200",
                            "text-sm font-semibold text-stone-600",
                            "transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600",
                            "px-2 py-2.5",
                        ].join(" ")}
                    >
                        <Icon
                            name="logout"
                            className="h-4 w-4 shrink-0"
                        />

                        <span className={`ml-2 hidden ${collapsed ? "" : "lg:inline"}`}>
                            Log out
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-20 flex h-16 items-center border-b border-stone-200 bg-white px-4 md:hidden relative">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-orange-600"
                        aria-label="Open navigation"
                    >
                        <Icon name="menu" className="h-5 w-5" />
                    </button>

                    <div className="absolute left-1/2 -translate-x-1/2">
                        <img
                            src="/gemmas-logo2.png"
                            alt="Gemma's Kitchenette"
                            className="h-auto w-32 object-contain"
                        />
                    </div>
                </header>

                <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="mx-auto w-full min-w-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
