import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import FoodCard from "../../components/customer/FoodCard";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import { getCategories } from "../../services/category.service";
import { getTodayMenu } from "../../services/dailyMenu.service";
import type { Category } from "../../types/Food";
import { getErrorMessage } from "../../utils/getErrorMessage";

function getCategoryId(value: string) {
    const categoryId = Number(value);

    return Number.isInteger(categoryId) && categoryId > 0
        ? categoryId
        : undefined;
}

export default function FoodsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search")?.trim() ?? "";
    const categoryId = getCategoryId(searchParams.get("category") ?? "");

    const foodsQuery = useQuery({
        queryKey: ["customer-foods", search, categoryId],
        queryFn: () =>
            getTodayMenu({
                search: search || undefined,
                categoryId,
            }),
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });

    const categoriesQuery = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const foods = foodsQuery.data ?? [];
    const categories = categoriesQuery.data ?? [];
    const error = foodsQuery.error || categoriesQuery.error;

    function updateFilters(nextSearch: string, nextCategoryId?: number) {
        const nextParams = new URLSearchParams(searchParams);

        if (nextSearch.trim()) {
            nextParams.set("search", nextSearch.trim());
        } else {
            nextParams.delete("search");
        }

        if (nextCategoryId) {
            nextParams.set("category", String(nextCategoryId));
        } else {
            nextParams.delete("category");
        }

        setSearchParams(nextParams);
    }

    function clearFilters() {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("search");
        nextParams.delete("category");
        setSearchParams(nextParams);
    }

    return (
        <div className="space-y-7 pb-8">
            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
                    Foods
                </h1>
                <p className="mt-2 text-base text-stone-600">
                    Browse our meals and find something you'll love.
                </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:p-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
                    <Input
                        type="search"
                        label="Search food"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(event) =>
                            updateFilters(event.target.value, categoryId)
                        }
                    />

                    <Select
                        label="Category"
                        value={categoryId ? String(categoryId) : ""}
                        onChange={(event) =>
                            updateFilters(
                                search,
                                getCategoryId(event.target.value),
                            )
                        }
                        className="h-10 border-stone-200 text-stone-900 focus:border-orange-500"
                    >
                        <option value="">All categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            <Alert
                type="error"
                message={
                    error
                        ? getErrorMessage(error, "Failed to load foods.")
                        : ""
                }
            />

            {(foodsQuery.isPending || categoriesQuery.isPending) && (
                <div className="flex justify-center py-16">
                    <Spinner label="Loading foods…" />
                </div>
            )}

            {!foodsQuery.isPending &&
                !categoriesQuery.isPending &&
                !error &&
                foods.length === 0 && (
                    <EmptyState
                        icon={<Icon name="bowl" className="h-6 w-6" />}
                        title="No foods found"
                        description="Try another search or category."
                        action={
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        }
                    />
                )}

            {!foodsQuery.isPending &&
                !categoriesQuery.isPending &&
                !error &&
                foods.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-5">
                        {foods.map((item) => (
                            <FoodCard key={item.id} menu={item} />
                        ))}
                    </div>
                )}
        </div>
    );
}
