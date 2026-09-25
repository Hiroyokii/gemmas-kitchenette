import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const FOOTER_LINK_CLASS =
  "rounded-sm text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800] focus-visible:ring-offset-4";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12 lg:px-9">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:gap-10 md:text-left">
          <div className="flex max-w-sm flex-col items-center md:items-start">
            <Link
              to="/"
              aria-label="Gemma’s Kitchenette home"
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800] focus-visible:ring-offset-4"
            >
              <img
                src="/gemmas-logo2.png"
                alt="Gemma’s Kitchenette"
                className="h-16 w-auto max-w-[min(100%,15rem)] object-contain md:h-[3.5rem]"
              />
            </Link>
            <p className="mt-6 font-display text-base font-semibold text-stone-900">
              Gemma&apos;s Kitchenette
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Home-cooked goodness, made just for you.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 md:justify-end md:pt-5"
          >
            <Link to="/" className={FOOTER_LINK_CLASS}>
              Home
            </Link>
            <Link to="/foods" className={FOOTER_LINK_CLASS}>
              Foods
            </Link>
            {user?.role === "CUSTOMER" && (
              <Link to="/orders" className={FOOTER_LINK_CLASS}>
                Orders
              </Link>
            )}
          </nav>
        </div>

        <div className="mt-8 border-t border-stone-200 pt-5 text-center md:mt-10 md:text-left">
          <p className="text-xs text-stone-500">
            © 2026 Gemma&apos;s Kitchenette
          </p>
        </div>
      </div>
    </footer>
  );
}
