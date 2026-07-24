import type { DailyMenu } from "../types/DailyMenu";

interface FoodCardProps {
    menu: DailyMenu;
}

export default function FoodCard({
    menu,
}: FoodCardProps) {

    return (
        
        <div className="border rounded-lg p-4 shadow">

            <h2 className="text-xl font-semibold">
                {menu.food.name}
            </h2>

            <p>
                ₱{menu.food.price}
            </p>

            <p>
                Remaining:
                {" "}
                {menu.remainingServings}
            </p>

            <button
                className="mt-3 rounded bg-orange-600 px-4 py-2 text-white"
            >
                Add to Cart
            </button>

        </div>
    );
}