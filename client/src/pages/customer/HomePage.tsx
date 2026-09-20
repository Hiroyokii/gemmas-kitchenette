import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import FoodCard from "../../components/customer/FoodCard";
import Icon from "../../components/ui/Icon";
import Spinner from "../../components/ui/Spinner";

import { getTodayMenu } from "../../services/dailyMenu.service";
import type { DailyMenu } from "../../types/DailyMenu";
import { getErrorMessage } from "../../utils/getErrorMessage";

const MENU_PREVIEW_LIMIT = 4;

export default function HomePage() {
  const navigate = useNavigate();

  const menuQuery = useQuery({
    queryKey: ["today-menu"],
    queryFn: () => getTodayMenu(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const menu = menuQuery.data ?? [];
  const previewMenu = menu.slice(0, MENU_PREVIEW_LIMIT);

  return (
    <div className="space-y-14 pb-8">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden rounded-3xl bg-cover bg-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-18"
        style={{ backgroundImage: "url('/gemmas-hero.png')" }}
      >
        {/* Left-to-right gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100 from-20% via-orange-100 via-40% via-orange-200/50 via-80% to-transparent to-100%" />

        {/* Decorative blur */}
        <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-orange-200/35 blur-3xl" />

        <div className="relative max-w-4xl">
          <img
            src="/gemmas-logo2.png"
            alt="Gemma's Kitchenette"
            className="mb-7 h-12 w-auto object-contain object-left sm:h-14"
          />

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#CC9400]">
            Made fresh with care
          </p>

          <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.03em] text-stone-900 sm:text-6xl lg:text-7xl">
            Home-cooked goodness,
            <br />
            <span className="font-editorial font-normal text-[#C28A00]">
              made just for you.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600 sm:text-lg">
            Freshly prepared food and comforting favorites from Gemma’s
            Kitchenette.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() =>
                document
                  .getElementById("todays-menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Order Now
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/foods")}
            >
              View Full Menu
            </Button>
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-20 flex justify-center">
        <button
          type="button"
          onClick={() =>
            document
              .getElementById("how-it-works")
              ?.scrollIntoView({ 
                behavior: "smooth",
                block: "center", })
          }
          aria-label="Scroll to learn more"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-stone-200 bg-white text-[#FFB800] shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>
      </div>

      <section id="how-it-works" className="bg-white py-14 sm:py-16 lg:py-1">
        <div className="mx-auto grid max-w-9xl grid-cols-1 gap-14 px-6 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-16 lg:px-9">

          {/* Order Online */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/gifs/online-order1.gif"
              alt="Order online"
              className="mb-6 h-28 w-28 object-contain"
            />

            <h3 className="text-xl font-bold uppercase tracking-wide text-stone-600">
              Order Online
            </h3>

            <p className="mt-3 max-w-xs text-base leading-6 text-stone-600">
              Select from our menu and easily place your order online from home.
            </p>
          </div>

          {/* We Cook For You */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/gifs/frying-pan1.gif"
              alt="We cook for you"
              className="mb-6 h-28 w-28 object-contain"
            />

            <h3 className="text-lg font-bold uppercase tracking-wide text-stone-600">
              We Cook For You
            </h3>

            <p className="mt-3 max-w-xs text-base leading-6 text-stone-600">
              Our chefs prepare your meals using fresh, authentic ingredients.
            </p>
          </div>

          {/* Delivery */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/gifs/door1.gif"
              alt="Delivery to your doorstep"
              className="mb-6 h-28 w-28 object-contain"
            />

            <h3 className="text-lg font-bold uppercase tracking-wide text-stone-600">
              We Deliver To Your Doorstep
            </h3>

            <p className="mt-3 max-w-xs text-base leading-6 text-stone-600">
              Your order will be delivered to your doorstep on your selected
              delivery day.
            </p>
          </div>

          {/* Heat and Eat */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/gifs/microwave1.gif"
              alt="Easy heat and eat"
              className="mb-6 h-28 w-28 object-contain"
            />

            <h3 className="text-lg font-bold uppercase tracking-wide text-stone-600">
              Easy Heat and Eat
            </h3>

            <p className="mt-3 max-w-xs text-base leading-6 text-stone-600">
              Simply, Heat and Eat!
            </p>
          </div>

        </div>
      </section>

      {/* Menu Section */}
      <section id="todays-menu" className="scroll-mt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Today’s Menu
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Freshly prepared today.
            </p>
          </div>

          <Link
            to="/foods"
            className="text-sm font-semibold text-[#C28A00] transition-colors hover:text-[#9F7000]"
          >
            View all →
          </Link>
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
          <div className="flex justify-center py-12">
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
          <FoodGrid menu={previewMenu} />
        )}

        {!menuQuery.isPending && menu.length > 0 && (
          <div className="mt-5 flex justify-center sm:justify-start">
            <Button
              variant="secondary"
              onClick={() => navigate("/foods")}
            >
              View Full Menu
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function FoodGrid({ menu }: { menu: DailyMenu[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {menu.map((item) => (
        <FoodCard key={item.id} menu={item} compact />
      ))}
    </div>
  );
}