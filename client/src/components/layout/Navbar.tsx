import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import Icon from "../ui/Icon";
import Button from "../ui/Button";

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
            isActive ? "text-brand-600" : "text-ink-600 hover:text-ink-900"
        }`;

    return (
        <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-50/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <Link
                    to="/"
                    className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
                        <Icon name="bowl" className="h-5 w-5" />
                    </span>
                    Gemma's Kitchenette
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
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

                <div className="hidden items-center gap-3 md:flex">
                    {user?.role === "CUSTOMER" && <CartButton itemCount={itemCount} />}

                    {(user?.role === "ADMIN" || user?.role === "STAFF") && (
                        <Link to="/admin">
                            <Button variant="secondary" size="sm">
                                Admin panel
                            </Button>
                        </Link>
                    )}

                    {user ? (
                        <div className="flex items-center gap-3 border-l border-ink-200 pl-3">
                            <span className="text-sm text-ink-600">
                                Hi, {user.firstName}
                            </span>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <Icon name="logout" className="h-4 w-4" />
                                Log out
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" size="sm">
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    {user?.role === "CUSTOMER" && <CartButton itemCount={itemCount} />}

                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700"
                    >
                        <Icon name={isMenuOpen ? "close" : "menu"} className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="border-t border-ink-200 bg-white px-4 py-4 md:hidden">
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

                    <div className="mt-4 border-t border-ink-100 pt-4">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-ink-600">
                                    Signed in as {user.firstName} {user.lastName}
                                </span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    Log out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex-1"
                                >
                                    <Button variant="secondary" size="sm" fullWidth>
                                        Log in
                                    </Button>
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex-1"
                                >
                                    <Button variant="primary" size="sm" fullWidth>
                                        Sign up
                                    </Button>
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
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
        >
            <Icon name="cart" className="h-5 w-5" />
            {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 font-mono text-[11px] font-semibold text-white">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
