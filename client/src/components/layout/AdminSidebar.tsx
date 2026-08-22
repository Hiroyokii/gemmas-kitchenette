import { Link, NavLink } from "react-router-dom";

import type { IconName } from "../ui/Icon";
import Icon from "../ui/Icon";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
    to: string;
    label: string;
    icon: IconName;
    end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/admin/menu", label: "Daily Menu", icon: "calendar" },
    { to: "/admin/orders", label: "Orders", icon: "list" },
    { to: "/admin/foods", label: "Foods", icon: "bowl" },
    { to: "/admin/recipes", label: "Recipes", icon: "book" },
    { to: "/admin/ingredients", label: "Ingredients", icon: "leaf" },
    { to: "/admin/purchases", label: "Purchases", icon: "bag" },
    { to: "/admin/reports", label: "Reports", icon: "chart" },
];

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const { user, logout } = useAuth();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-ink-200 bg-white transition-transform duration-200 ease-out",
                    "lg:static lg:z-auto lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                <div className="flex h-16 items-center gap-2 border-b border-ink-200 px-5">
                    <Link
                        to="/admin"
                        onClick={onClose}
                        className="flex items-center gap-2 font-display text-base font-semibold text-ink-900"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
                            <Icon name="bowl" className="h-4 w-4" />
                        </span>
                        Gemma's Kitchen
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={onClose}
                            className={({ isActive }) =>
                                [
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-brand-500 text-white"
                                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                                ].join(" ")
                            }
                        >
                            <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-ink-200 p-4">
                    <p className="truncate text-sm font-medium text-ink-800">
                        {user?.firstName} {user?.lastName}
                    </p>
                    <p className="mb-2 text-xs text-ink-400">{user?.role}</p>
                    <button
                        type="button"
                        onClick={() => logout()}
                        className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
                    >
                        <Icon name="logout" className="h-3.5 w-3.5" />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}
