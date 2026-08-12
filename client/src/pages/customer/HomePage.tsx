import { useEffect, useState } from "react";

import { getTodayMenu } from "../../services/dailyMenu.service";
import type { DailyMenu } from "../../types/DailyMenu";
import FoodCard from "../../components/FoodCard";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function HomePage() {

    const [menu, setMenu] = 
    useState<DailyMenu[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        async function fetchMenu() {

            try {

                const data = 
                    await getTodayMenu();
                
                setMenu(data);

            } catch (err) {

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load today's menu."
                    )
                );

            } finally {

                setLoading(false);

            }

        }

        fetchMenu();
    }, []);

    if (loading) {
        return <p>Loading today's menu...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (menu.length === 0) {
        return (
            <p>
                No food has been prepared today.
            </p>
        )
    }

    return (
        <div className="space-y-4">

            <h1 className="text-3xl font-bold">
                Today's Menu
            </h1>

            {menu.map((item) => (

                <FoodCard
                    key={item.id}
                    menu={item}
                />

            ))}

        </div>
    );
}
