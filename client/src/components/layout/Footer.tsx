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

          <div className="flex flex-col items-center gap-5 md:items-end md:pt-5">
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 md:justify-end"
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

            <nav aria-label="Contact us" className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Find us on Facebook"
                title="Facebook"
                className="flex items-center justify-center p-1 text-stone-600 transition-colors hover:text-[#9A6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                  <path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.2v3.2H10V21h3.4z" />
                </svg>
              </a>
              <a
                href="https://www.messenger.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Message us on Messenger"
                title="Messenger"
                className="flex items-center justify-center p-1 text-stone-600 transition-colors hover:text-[#9A6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                  <path d="M12 2.5c-5.3 0-9.5 3.9-9.5 9 0 2.7 1.2 5 3.2 6.6v3.4l3.3-1.8c.9.3 1.9.5 3 .5 5.3 0 9.5-3.9 9.5-9s-4.2-8.7-9.5-8.7zm1 12-2.4-2.6-4.6 2.6 5-5.3 2.5 2.6 4.5-2.6-5 5.3z" />
                </svg>
              </a>
              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Contact us with Gmail"
                title="Gmail"
                className="flex items-center justify-center p-1 text-stone-600 transition-colors hover:text-[#9A6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </a>
            </nav>
          </div>
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
