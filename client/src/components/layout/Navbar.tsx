import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import Icon from "../ui/Icon";

const NAV_LINKS = [{ to: "/", label: "Menu", end: true }];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    async function handleLogout() {
        setIsMenuOpen(false);
        await logout();
        navigate("/");
    }

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium transition-colors ${
            isActive ? "text-orange-600" : "text-stone-500 hover:text-stone-900"
        }`;

    const iconButtonClass =
        "flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:border-orange-300 hover:text-orange-600";

    const ghostButtonClass =
        "rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 active:bg-stone-100";

    const outlineButtonClass =
        "rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100";

    const primaryButtonClass =
        "rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 active:bg-orange-800";

    return (
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 shadow-[0_1px_20px_rgba(0,0,0,0.04)] backdrop-blur">
            {/* Top row: mobile controls (left) | centered logo | account area (right) */}
            <div className="relative mx-auto flex h-36 max-w-9xl items-center justify-between px-4 sm:px-12">
                {/* Left: mobile menu toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        className={iconButtonClass}
                    >
                        <Icon name={isMenuOpen ? "close" : "menu"} className="h-5 w-5" />
                    </button>
                </div>
                <div className="hidden md:block" />

                {/* Center: logo, always visually centered regardless of side content width */}
                <Link
                    to="/"
                    className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 font-display text-lg font-semibold tracking-tight text-stone-900"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div className="mx-auto mb-6 w-64">
                        <img
                            src="/gemmas-logo2.png"
                            alt="Gemma's Kitchenette"
                            className="h-full w-full object-contain"
                        />
                    </div>
                </Link>

                {/* Right: account area (desktop) */}
                <div className="hidden items-center gap-3 md:flex">
                    {user?.role === "CUSTOMER" && <CartButton itemCount={itemCount} />}

                    {(user?.role === "ADMIN" || user?.role === "STAFF") && (
                        <Link to="/admin" className={ghostButtonClass}>
                            Admin panel
                        </Link>
                    )}

                    {user ? (
                        <div className="flex items-center gap-3 border-l border-stone-200 pl-3">
                            <span className="text-sm text-stone-500">
                                Hi, {user.firstName}
                            </span>
                            <button type="button" onClick={handleLogout} className={ghostButtonClass}>
                                <span className="inline-flex items-center gap-1.5">
                                    <Icon name="logout" className="h-4 w-4" />
                                    Log out
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className={outlineButtonClass}>
                                Log in
                            </Link>
                            <Link to="/register" className={primaryButtonClass}>
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right: cart only, on mobile */}
                <div className="flex items-center gap-2 md:hidden">
                    {user?.role === "CUSTOMER" && <CartButton itemCount={itemCount} />}
                </div>
            </div>

            {/* Bottom row: centered nav links (desktop) */}
            <nav className="hidden items-center justify-center gap-6 border-t border-stone-100 py-3 md:flex">
                {NAV_LINKS.map((link) => (
                    <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                        {link.label}
                    </NavLink>
                ))}

                {user?.role === "CUSTOMER" && (
                    <NavLink to="/orders" className={linkClass}>
                        My Orders
                    </NavLink>
                )}
            </nav>

            {/* Mobile dropdown */}
            {isMenuOpen && (
                <div className="border-t border-stone-200 bg-white px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:hidden">
                    <nav className="flex flex-col gap-3">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={() => setIsMenuOpen(false)}
                                className={linkClass}
                            >
                                {link.label}
                            </NavLink>
                        ))}

                        {user?.role === "CUSTOMER" && (
                            <NavLink
                                to="/orders"
                                onClick={() => setIsMenuOpen(false)}
                                className={linkClass}
                            >
                                My Orders
                            </NavLink>
                        )}

                        {(user?.role === "ADMIN" || user?.role === "STAFF") && (
                            <Link
                                to="/admin"
                                onClick={() => setIsMenuOpen(false)}
                                className={linkClass({ isActive: false })}
                            >
                                Admin panel
                            </Link>
                        )}
                    </nav>

                    <div className="mt-4 border-t border-stone-100 pt-4">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-stone-500">
                                    Signed in as {user.firstName} {user.lastName}
                                </span>
                                <button type="button" onClick={handleLogout} className={ghostButtonClass}>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Icon name="logout" className="h-4 w-4" />
                                        Log out
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex-1 text-center ${outlineButtonClass}`}
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex-1 text-center ${primaryButtonClass}`}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function CartButton({ itemCount }: { itemCount: number }) {
    return (
        <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:border-orange-300 hover:text-orange-600"
        >
            <Icon name="cart" className="h-5 w-5" />
            {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 font-mono text-[11px] font-semibold text-white">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
