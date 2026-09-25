import { useQuery } from "@tanstack/react-query";
import { useNavigate} from "react-router-dom";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import FoodCard from "../../components/customer/FoodCard";
import HomeFaq from "../../components/customer/HomeFaq";
import Icon from "../../components/ui/Icon";
import Spinner from "../../components/ui/Spinner";

import { getTodayMenu } from "../../services/dailyMenu.service";
import type { DailyMenu } from "../../types/DailyMenu";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function HomePage() {
  const navigate = useNavigate();

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
          className="
              relative overflow-hidden rounded-3xl
              bg-orange-50
              bg-cover bg-center
              px-4 py-8
              text-center
              md:bg-[url('/hero.png')]
              md:px-8 md:py-10 md:text-left
              lg:px-14 lg:py-18
            "
          >
        {/* Left-to-right gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 from-20% via-orange-100 via-40% via-orange-200/50 via-100% to-transparent to-100%" />

        {/* Decorative blur */}
        <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-orange-200/35 blur-3xl" />

        <div className="relative mx-auto max-w-md md:mx-0 md:max-w-3xl lg:max-w-4xl">
          <img
            src="/gemmas-logo2.png"
            alt="Gemma's Kitchenette"
            className="mx-auto mb-6 h-12 w-auto object-contain md:mx-0 md:mb-7 md:h-14 md:object-left"
          />

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.32em] text-[#FFB800]">
            Made fresh with care
          </p>

          <h1 className="font-display text-4xl leading-[0.95] tracking-[-0.06em] text-stone-900 md:text-5xl lg:text-7xl">
            Home-cooked goodness,
            <br />
            <span className="font-editorial font-normal text-[#FFB800]">
              made just for you.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-stone-600 md:mx-0 md:text-lg">
            Freshly prepared food and comforting favorites from Gemma’s
            Kitchenette.
          </p>

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
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
              .getElementById("todays-menu")
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
      
      {/* How It Works */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-title"
        className="w-full min-w-0  p-2 md:p-6 lg:p-10"
      >
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex px-3 py-1 text-xs font-display uppercase tracking-[0.32em] text-[#FFB800] md:text-sm">
            How It Works
          </p>
          <h2
            id="how-it-works-title"
            className="mt-1 font-display text-3xl leading-tight tracking-[-0.03em] text-stone-900 md:text-4xl lg:text-5xl"
          >
            Simple steps. Easy ordering.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-500 md:text-base md:leading-7">
            Order your favorite meals and let Gemma&apos;s Kitchenette take care of
            the rest.
          </p>
        </header>

        <div className="mt-7 grid auto-rows-fr grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-3 lg:mt-10 lg:gap-5">
          <article className="flex h-full min-w-0 flex-col items-center rounded-2xl border border-stone-200 bg-white p-3 text-center md:p-3 lg:p-5">
            <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB800]/25 text-xs font-bold text-stone-900 md:mb-2.5">
              1
            </span>
            <div className="flex h-14 items-center justify-center md:h-14 lg:h-20">
              <img
                src="/gifs/online-order1.gif"
                alt="Order online"
                className="h-12 w-12 object-contain md:h-14 md:w-14 lg:h-20 lg:w-20"
              />
            </div>
            <h3 className="mt-2 min-h-8 text-xs font-bold uppercase leading-4 tracking-wide text-stone-700 md:min-h-8 md:text-xs lg:mt-3 lg:min-h-10 lg:text-base lg:leading-5">
              Order Online
            </h3>
            <p className="mt-1.5 text-[11px] leading-4 text-stone-600 md:mt-2 md:text-xs md:leading-4 lg:mt-2 lg:text-sm lg:leading-5">
              Select from our menu and easily place your order online from home.
            </p>
          </article>

          <article className="flex h-full min-w-0 flex-col items-center rounded-2xl border border-stone-200 bg-white p-3 text-center md:p-3 lg:p-5">
            <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB800]/25 text-xs font-bold text-stone-900 md:mb-2.5">
              2
            </span>
            <div className="flex h-14 items-center justify-center md:h-14 lg:h-20">
              <img
                src="/gifs/frying-pan1.gif"
                alt="We cook for you"
                className="h-12 w-12 object-contain md:h-14 md:w-14 lg:h-20 lg:w-20"
              />
            </div>
            <h3 className="mt-2 min-h-8 text-xs font-bold uppercase leading-4 tracking-wide text-stone-700 md:min-h-8 md:text-xs lg:mt-3 lg:min-h-10 lg:text-base lg:leading-5">
              We Cook For You
            </h3>
            <p className="mt-1.5 text-[11px] leading-4 text-stone-600 md:mt-2 md:text-xs md:leading-4 lg:mt-2 lg:text-sm lg:leading-5">
              Our chefs prepare your meals using fresh, authentic ingredients.
            </p>
          </article>

          <article className="flex h-full min-w-0 flex-col items-center rounded-2xl border border-stone-200 bg-white p-3 text-center md:p-3 lg:p-5">
            <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB800]/25 text-xs font-bold text-stone-900 md:mb-2.5">
              3
            </span>
            <div className="flex h-14 items-center justify-center md:h-14 lg:h-20">
              <img
                src="/gifs/door1.gif"
                alt="Delivery to your doorstep"
                className="h-12 w-12 object-contain md:h-14 md:w-14 lg:h-20 lg:w-20"
              />
            </div>
            <h3 className="mt-2 min-h-8 text-xs font-bold uppercase leading-4 tracking-wide text-stone-700 md:min-h-8 md:text-xs lg:mt-3 lg:min-h-10 lg:text-base lg:leading-5">
              Right To Your Doorstep
            </h3>
            <p className="mt-1.5 text-[11px] leading-4 text-stone-600 md:mt-2 md:text-xs md:leading-4 lg:mt-2 lg:text-sm lg:leading-5">
              Your order will be delivered to your doorstep on your selected delivery day.
            </p>
          </article>

          <article className="flex h-full min-w-0 flex-col items-center rounded-2xl border border-stone-200 bg-white p-3 text-center md:p-3 lg:p-5">
            <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FFB800]/25 text-xs font-bold text-stone-900 md:mb-2.5">
              4
            </span>
            <div className="flex h-14 items-center justify-center md:h-14 lg:h-20">
              <img
                src="/gifs/microwave1.gif"
                alt="Easy heat and eat"
                className="h-12 w-12 object-contain md:h-14 md:w-14 lg:h-20 lg:w-20"
              />
            </div>
            <h3 className="mt-2 min-h-8 text-xs font-bold uppercase leading-4 tracking-wide text-stone-700 md:min-h-8 md:text-xs lg:mt-3 lg:min-h-10 lg:text-base lg:leading-5">
              Easy Heat And Eat
            </h3>
            <p className="mt-1.5 text-[11px] leading-4 text-stone-600 md:mt-2 md:text-xs md:leading-4 lg:mt-2 lg:text-sm lg:leading-5">
              Simply, Heat and Eat!
            </p>
          </article>
        </div>
      </section>

      {/* Menu Section */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 border-y border-stone-200 bg-white">
        <section
          id="todays-menu"
          className="scroll-mt-8 overflow-hidden py-12 md:py-20 lg:py-20"
        >
          <div className="mx-auto grid w-full  max-w-[1320px] grid-cols-1 items-center gap-10 px-4 md:gap-12 md:px-6 lg:grid-cols-[23rem_minmax(0,1fr)] lg:gap-12 lg:px-9">
            {/* Left Content */}
            <div className="mx-auto min-w-0 max-w-[28rem] text-center lg:mx-0 lg:text-left">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-[#FFB800]">
                Today’s menu
              </p>

              <h2 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-stone-900 md:text-5xl lg:text-6xl">
                Fresh food,
                <br />
                made for you.
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-stone-500 md:text-lg">
                Freshly prepared meals and comforting favorites from Gemma’s
                Kitchenette, available today.
              </p>

              <div className="mt-9">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate("/foods")}
                >
                  View Full Menu
                </Button>
              </div>
            </div>

            {/* Right Food Slider */}
            <div className="min-w-0 max-w-full overflow-hidden">
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
                <FoodSlider menu={menu} />
              )}
            </div>
          </div>
        </section>
      </div>

      <HomeFaq />

      <section
        aria-labelledby="home-order-cta-title"
        className="flex flex-col items-center gap-6 rounded-3xl bg-[#FFB800] px-5 py-9 text-center md:flex-row md:justify-between md:px-8 md:py-10 md:text-left lg:px-13 lg:py-13"
      >
        <div className="max-w-2xl">
          <h2
            id="home-order-cta-title"
            className="font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-stone-900 md:text-4xl"
          >
            Ready to order something delicious?
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-800 md:text-base">
            Browse today&apos;s menu and enjoy freshly prepared food from Gemma&apos;s
            Kitchenette.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate("/foods")}
          variant="secondary"
        >
          Order Now
        </Button>
      </section>
    </div>
  );
}

function FoodSlider({ menu }: { menu: DailyMenu[] }) {
  return (
    <div className="overflow-hidden">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 md:gap-4 lg:gap-5">
        {menu.map((item) => (
          <div
            key={item.id}
            className="
              w-[calc((100vw-3.25rem)/2)]
              min-w-[280px]
              max-w-[330px]
              shrink-0
              snap-start

              md:w-[300px]

              lg:w-[330px]
            "
          >
            <FoodCard menu={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
