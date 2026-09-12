import type { DailyMenu } from "../../types/DailyMenu";
import { useCart } from "../../hooks/useCart";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

interface FoodCardProps { menu: DailyMenu; }

export default function FoodCard({ menu }: FoodCardProps) {
    const { cart, addToCart, decreaseQuantity } = useCart();
    const quantityInCart = cart.find((item) => item.menu.id === menu.id)?.quantity ?? 0;
    const isSoldOut = menu.remainingServings <= 0;
    const isLowStock = !isSoldOut && menu.remainingServings <= 5;
    const canIncrease = quantityInCart < menu.remainingServings;

    return <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_24px_rgba(41,37,36,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(41,37,36,0.12)]">
        <div className="relative m-3 aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
            {menu.food.imageUrl ? <img src={menu.food.imageUrl} alt={menu.food.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-stone-300"><Icon name="bowl" className="h-12 w-12" /></div>}
            {isSoldOut && <div className="absolute inset-0 flex items-center justify-center bg-stone-900/45"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-800">Sold out</span></div>}
        </div>
        <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
            <div className="flex items-start justify-between gap-3"><h3 className="min-w-0 font-display text-xl font-bold leading-tight text-stone-900">{menu.food.name}</h3><span className="shrink-0 font-mono text-lg font-bold text-orange-600">₱{Number(menu.food.price).toFixed(2)}</span></div>
            <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-stone-500">{menu.food.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                {!isSoldOut ? <Badge tone={isLowStock ? "gold" : "leaf"}>{isLowStock ? `${menu.remainingServings} left` : "Available"}</Badge> : <span className="text-sm text-stone-400">Come back tomorrow</span>}
                {quantityInCart === 0 ? <Button size="sm" disabled={isSoldOut} onClick={() => addToCart(menu)}>Order Now</Button> : <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1"><button type="button" onClick={() => decreaseQuantity(menu.id)} aria-label={`Remove one ${menu.food.name}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-stone-700 shadow-sm hover:bg-stone-100"><Icon name="minus" className="h-3.5 w-3.5" /></button><span className="w-6 text-center font-mono text-sm font-semibold text-stone-800">{quantityInCart}</span><button type="button" onClick={() => addToCart(menu)} disabled={!canIncrease} aria-label={`Add one ${menu.food.name}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-stone-700 shadow-sm hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"><Icon name="plus" className="h-3.5 w-3.5" /></button></div>}
            </div>
        </div>
    </article>;
}
