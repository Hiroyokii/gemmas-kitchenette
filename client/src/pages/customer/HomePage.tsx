import { useEffect, useState } from "react";

import { getTodayMenu } from "../../services/dailyMenu.service";
import type { DailyMenu } from "../../types/DailyMenu";
import { getErrorMessage } from "../../utils/getErrorMessage";

import FoodCard from "../../components/customer/FoodCard";
import PageHeader from "../../components/ui/PageHeader";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";

const TODAY_LABEL = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
});

export default function HomePage() {
    const [menu, setMenu] = useState<DailyMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchMenu() {
            try {
                const data = await getTodayMenu();
                setMenu(data);
            } catch (err) {
                setError(getErrorMessage(err, "Failed to load today's menu."));
            } finally {
                setLoading(false);
            }
        }

        fetchMenu();
    }, []);

    return (
        <div>
            <PageHeader title="Today's Menu" description={TODAY_LABEL} />

            <Alert type="error" message={error} />

            {loading && (
                <div className="flex justify-center py-16">
                    <Spinner label="Loading today's menu…" />
                </div>
            )}

            {!loading && !error && menu.length === 0 && (
                <EmptyState
                    icon={<Icon name="bowl" className="h-6 w-6" />}
                    title="Nothing prepared yet today"
                    description="Check back a little later — the kitchen posts the menu once cooking starts."
                />
            )}

            {!loading && menu.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {menu.map((item) => (
                        <FoodCard key={item.id} menu={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
