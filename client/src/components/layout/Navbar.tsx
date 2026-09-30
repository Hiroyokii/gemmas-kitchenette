import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import Icon from "../ui/Icon";
import Button from "../ui/Button";

const NAV_LINKS = [
    { to: "/", label: "Home", end: true, icon: "dashboard" as const },
    { to: "/foods", label: "Menu", icon: "bowl" as const },
];

const ICON_BUTTON_CLASS =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:border-[#FFB800] hover:text-[#da9c00]";

const GHOST_BUTTON_CLASS =
    "rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 active:bg-stone-100";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { openCart } = useCartDrawer();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    async function handleLogout() {
        setIsMenuOpen(false);
        await logout();
        navigate("/");
    }

    function linkClass({ isActive }: { isActive: boolean }) {
        return `text-sm font-medium transition-colors ${
            isActive
                ? "text-[#C28A00]"
                : "text-stone-500 hover:text-stone-900"
        }`;
    }

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 shadow-[0_1px_20px_rgba(0,0,0,0.04)] backdrop-blur lg:static">
                <div className="relative mx-auto flex h-26 max-w-9xl items-center justify-between px-4 md:px-8 lg:px-12">
                    {/* Mobile menu button */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            aria-label={
                                isMenuOpen ? "Close menu" : "Open menu"
                            }
                            aria-expanded={isMenuOpen}
                            className={ICON_BUTTON_CLASS}
                        >
                            <Icon
                                name={isMenuOpen ? "close" : "menu"}
                                className="h-5 w-5"
                            />
                        </button>
                    </div>

                    {/* Desktop spacer */}
                    <div className="hidden lg:block" />

                    {/* Logo */}
                    <Link
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 font-display text-lg font-semibold tracking-tight text-stone-900"
                    >
                        <div className="mx-auto w-40 md:w-54">
                            <img
                                src="/gemmas-logo2.png"
                                alt="Gemma's Kitchenette"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </Link>

                    {/* Desktop account area */}
                    <div className="hidden items-center gap-3 lg:flex">
                        {user?.role === "CUSTOMER" && (
                            <CartButton itemCount={itemCount} onClick={openCart} />
                        )}

                        {isAdminOrStaff(user?.role) && (
                            <Link
                                to="/admin"
                                className={GHOST_BUTTON_CLASS}
                            >
                                Admin panel
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3 border-l border-stone-200 pl-3">
                                <span className="text-sm text-stone-500">
                                    Hi, {user.firstName}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={GHOST_BUTTON_CLASS}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <Icon
                                            name="logout"
                                            className="h-4 w-4"
                                        />
                                        Log out
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <AuthButtons />
                        )}
                    </div>

                    {/* Mobile cart */}
                    <div className="flex items-center gap-2 lg:hidden">
                        {user?.role === "CUSTOMER" && (
                            <CartButton itemCount={itemCount} onClick={openCart} />
                        )}
                    </div>
                </div>
            </header>

            {/* Desktop sticky navigation */}
            <nav className="sticky top-0 z-40 hidden items-center justify-center gap-6 border-b border-stone-200 bg-white/95 py-4 shadow-sm backdrop-blur lg:flex">
                {NAV_LINKS.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={linkClass}
                    >
                        {link.label}
                    </NavLink>
                ))}

                {user?.role === "CUSTOMER" && (
                    <NavLink to="/orders" className={linkClass}>
                        My Orders
                    </NavLink>
                )}
            </nav>

            {/* Mobile sidebar */}
            <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsMenuOpen(false)}
                className={`fixed inset-0 z-[55] bg-black/35 transition-opacity lg:hidden ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            <aside
                aria-label="Mobile navigation"
                aria-hidden={!isMenuOpen}
                inert={!isMenuOpen}
                className={`fixed inset-y-0 left-0 z-[60] flex w-62 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out lg:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-stone-200 px-5">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close navigation"
                        className={ICON_BUTTON_CLASS}
                    >
                        <Icon name="close" className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-[#FFB800] text-stone-950" : "text-stone-600 hover:bg-amber-50 hover:text-stone-950"}`}
                            >
                                <Icon name={link.icon} className="h-5 w-5 shrink-0" />
                                {link.label}
                            </NavLink>
                        ))}

                        {user?.role === "CUSTOMER" && (
                            <NavLink
                                to="/orders"
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-[#FFB800] text-stone-950" : "text-stone-600 hover:bg-amber-50 hover:text-stone-950"}`}
                            >
                                <Icon name="list" className="h-5 w-5 shrink-0" />
                                My Orders
                            </NavLink>
                        )}

                        {isAdminOrStaff(user?.role) && (
                            <Link
                                to="/admin"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-amber-50 hover:text-stone-950"
                            >
                                <Icon name="dashboard" className="h-5 w-5 shrink-0" />
                                Admin panel
                            </Link>
                        )}
                    </nav>

                    <div className="shrink-0 border-t border-stone-200 p-4">
                        {user ? (
                            <div className="space-y-3">
                                <span className="block truncate text-sm text-stone-500">
                                    Signed in as {user.firstName} {user.lastName}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={GHOST_BUTTON_CLASS}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <Icon
                                            name="logout"
                                            className="h-4 w-4"
                                        />
                                        Log out
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <AuthButtons />
                        )}
                    </div>
            </aside>
        </>
    );
}

function isAdminOrStaff(role?: string) {
    return role === "ADMIN" || role === "STAFF";
}

function AuthButtons() {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2">
            <Button type="button" variant="secondary" size="md" onClick={() => navigate("/login")}>
                Log in
            </Button>

            <Button type="button" variant="primary" size="md" onClick={() => navigate("/register")}>
                Sign up
            </Button>
        </div>
    );
}

function CartButton({ itemCount, onClick }: { itemCount: number; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Cart, ${itemCount} item${
                itemCount === 1 ? "" : "s"
            }`}
            className={`${ICON_BUTTON_CLASS} relative`}
        >
            <Icon name="cart" className="h-5 w-5" />

            {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFB800] px-1 font-mono text-[11px] font-semibold text-white">
                    {itemCount}
                </span>
            )}
        </button>
    );
}

