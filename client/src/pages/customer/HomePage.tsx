import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import FoodCard from "../../components/customer/FoodCard";
import Icon from "../../components/ui/Icon";
import Spinner from "../../components/ui/Spinner";
import { getTodayMenu } from "../../services/dailyMenu.service";
import type { DailyMenu } from "../../types/DailyMenu";
import { getErrorMessage } from "../../utils/getErrorMessage";

const TODAY_LABEL = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function HomePage() {
  const menuQuery = useQuery({
    queryKey: ["today-menu"],
    queryFn: () => getTodayMenu(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const menu = menuQuery.data ?? [];


  return (
    <div className="space-y-14 pb-8">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden rounded-3xl border border-orange-100 bg-cover bg-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-6"
        style={{ backgroundImage: "url('/gemmas-hero.png')" }}
      >
        {/* Left-to-right gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200 via-orange-50/90 to-transparent" />

        {/* Decorative blur */}
        <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-orange-200/35 blur-3xl" />

        <div className="relative max-w-2xl">
          <img
            src="/gemmas-logo2.png"
            alt="Gemma's Kitchenette"
            className="mb-7 h-12 w-auto object-contain object-left sm:h-14"
          />

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
            Made fresh with care
          </p>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            Home-cooked goodness, made for you.
          </h1>

          <p className="mt-5 max-w-lg text-base leading- text-stone-600 sm:text-lg">
            Freshly prepared food and comforting favorites from Gemma’s
            Kitchenette.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#todays-menu"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Order Now
            </a>

            <Link
              to="/foods"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-orange-200 bg-white px-5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="todays-menu" className="scroll-mt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
              {TODAY_LABEL}
            </p>

            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900">
              Today’s Menu
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              A comforting selection, prepared fresh for today.
            </p>
          </div>
        </div>

        <Alert
          type="error"
          message={
            menuQuery.error
              ? getErrorMessage(
                  menuQuery.error,
                  "Failed to load today's menu.",
                )
              : ""
          }
        />

        {menuQuery.isPending && (
          <div className="flex justify-center py-16">
            <Spinner label="Loading today's menu…" />
          </div>
        )}

        {!menuQuery.isPending &&
          !menuQuery.error &&
          menu.length === 0 && (
            <EmptyState
              icon={<Icon name="bowl" className="h-6 w-6" />}
              title="Nothing prepared yet today"
              description="Check back a little later — the kitchen posts the menu once cooking starts."
            />
          )}

        {!menuQuery.isPending && menu.length > 0 && (
          <FoodGrid menu={menu} />
        )}
      </section>
    </div>
  );
}

function FoodGrid({ menu }: { menu: DailyMenu[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {menu.map((item) => (
        <FoodCard key={item.id} menu={item} />
      ))}
    </div>
  );
}
