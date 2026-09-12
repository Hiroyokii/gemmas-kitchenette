import { useQuery } from "@tanstack/react-query";

import { getTodayMenu } from "../../services/dailyMenu.service";
import type { DailyMenu } from "../../types/DailyMenu";
import { getErrorMessage } from "../../utils/getErrorMessage";
import FoodCard from "../../components/customer/FoodCard";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import Spinner from "../../components/ui/Spinner";

const TODAY_LABEL = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

function isMeryenda(item: DailyMenu) {
    return item.food.category?.name.toLocaleLowerCase().includes("meryenda") ?? false;
}

export default function HomePage() {
    const menuQuery = useQuery({ queryKey: ["today-menu"], queryFn: getTodayMenu });
    const menu = menuQuery.data ?? [];
    const meals = menu.filter((item) => !isMeryenda(item));
    const meryenda = menu.filter(isMeryenda);
    const heroImage = menu.find((item) => item.food.imageUrl)?.food.imageUrl;

    return <div className="space-y-14 pb-8">
        <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-stone-50 to-amber-100/70 px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="absolute -left-16 -top-20 h-52 w-52 rounded-full bg-orange-200/35 blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
                <div className="max-w-xl">
                    <img src="/gemmas-logo2.png" alt="Gemma's Kitchenette" className="mb-7 h-12 w-auto object-contain object-left sm:h-14" />
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Made fresh with care</p>
                    <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">Home-cooked goodness, made for you.</h1>
                    <p className="mt-5 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">Freshly prepared meals and meryenda from Gemma’s Kitchenette.</p>
                    <div className="mt-8 flex flex-wrap gap-3"><a href="#todays-menu" className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">Order Now</a><a href="#todays-menu" className="inline-flex h-11 items-center justify-center rounded-lg border border-orange-200 bg-white px-5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50">View Today's Menu</a></div>
                </div>
                <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                    <div className="absolute -inset-4 rounded-[2.25rem] bg-orange-300/25 blur-2xl" />
                    <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border-8 border-white bg-stone-200 shadow-xl">
                        {heroImage ? <img src={heroImage} alt="Freshly prepared food from Gemma's Kitchenette" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-orange-200 to-amber-100 text-center"><Icon name="bowl" className="h-16 w-16 text-orange-600" /><p className="mt-3 font-display text-lg font-semibold text-stone-700">Fresh from Gemma’s kitchen</p></div>}
                    </div>
                </div>
            </div>
        </section>

        <section id="todays-menu" className="scroll-mt-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">{TODAY_LABEL}</p><h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900">Today’s Menu</h2><p className="mt-2 text-sm text-stone-500">A comforting selection, prepared for today.</p></div></div>
            <Alert type="error" message={menuQuery.error ? getErrorMessage(menuQuery.error, "Failed to load today's menu.") : ""} />
            {menuQuery.isPending && <div className="flex justify-center py-16"><Spinner label="Loading today's menu…" /></div>}
            {!menuQuery.isPending && !menuQuery.error && menu.length === 0 && <EmptyState icon={<Icon name="bowl" className="h-6 w-6" />} title="Nothing prepared yet today" description="Check back a little later — the kitchen posts the menu once cooking starts." />}
            {!menuQuery.isPending && meals.length > 0 && <FoodGrid menu={meals} />}
            {!menuQuery.isPending && meryenda.length > 0 && <section className="mt-14"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">A little something extra</p><h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-stone-900">Meryenda</h2><p className="mt-2 text-sm text-stone-500">Light bites and comforting afternoon favorites.</p></div><FoodGrid menu={meryenda} /></section>}
        </section>
    </div>;
}

function FoodGrid({ menu }: { menu: DailyMenu[] }) {
    return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{menu.map((item) => <FoodCard key={item.id} menu={item} />)}</div>;
}
