import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    prepareFoodSchema,
    type PrepareFoodFormInput,
    type PrepareFoodForm,
} from "../../schemas/dailyMenu.schema";

import {
    getTodayMenuForAdmin,
    prepareDailyFood,
} from "../../services/dailyMenu.service";

import { getFoods } from "../../services/food.service";

import type { DailyMenu } from "../../types/DailyMenu";
import type { Food } from "../../types/Food";

import { getErrorMessage } from "../../utils/getErrorMessage";

import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";

export default function DailyMenuPage() {
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const menuQuery = useQuery<DailyMenu[]>({
        queryKey: ["daily-menu", "today"],
        queryFn: getTodayMenuForAdmin,
    });

    const foodsQuery = useQuery<Food[]>({
        queryKey: ["foods"],
        queryFn: () => getFoods(),
    });

    const menu = menuQuery.data ?? [];
    const foods = foodsQuery.data ?? [];

    const preparedFoodIds = new Set(
        menu.map((item) => item.food.id)
    );

    const availableFoods = foods.filter(
        (food) => !preparedFoodIds.has(food.id)
    );

    return (
        <div className="min-w-0 px-6 py-6 lg:px-8 lg:py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-900">
                        Today's Menu
                    </h1>

                    <p className="mt-1 text-sm text-ink-500">
                        Manage the food prepared and available for today.
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                >
                    + Prepare Food
                </Button>
            </div>

            {/* Loading / error */}
            {menuQuery.isError && (
                <div className="mb-4">
                    <Alert
                        type="error"
                        message={getErrorMessage(
                            menuQuery.error,
                            "Failed to load today's menu."
                        )}
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-stone-200 bg-stone-50 text-left">
                            <tr>
                                <th className="px-5 py-3 font-medium text-ink-700">
                                    Food
                                </th>
                                <th className="px-5 py-3 font-medium text-ink-700">
                                    Prepared
                                </th>
                                <th className="px-5 py-3 font-medium text-ink-700">
                                    Remaining
                                </th>
                                <th className="px-5 py-3 font-medium text-ink-700">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-stone-100">
                            {menuQuery.isPending && (
                                <tr>
                                    <td
                                        className="px-5 py-8 text-center text-sm text-ink-500"
                                        colSpan={4}
                                    >
                                        Loading today's menu...
                                    </td>
                                </tr>
                            )}

                            {!menuQuery.isPending &&
                                !menuQuery.isError &&
                                menu.length === 0 && (
                                    <tr>
                                        <td
                                            className="px-5 py-8 text-center text-sm text-ink-500"
                                            colSpan={4}
                                        >
                                            Nothing prepared today yet.
                                        </td>
                                    </tr>
                                )}

                            {!menuQuery.isPending &&
                                menu.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition-colors hover:bg-stone-50"
                                    >
                                        <td className="px-5 py-4 font-medium text-ink-900">
                                            {item.food.name}
                                        </td>

                                        <td className="px-5 py-4 text-ink-700">
                                            {item.preparedServings}
                                        </td>

                                        <td className="px-5 py-4 text-ink-700">
                                            {item.remainingServings}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={[
                                                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                                                    item.remainingServings > 0
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-stone-100 text-stone-600",
                                                ].join(" ")}
                                            >
                                                {item.remainingServings > 0
                                                    ? "Available"
                                                    : "Sold out"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <PrepareFoodModal
                    foods={availableFoods}
                    isLoadingFoods={foodsQuery.isPending}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        setIsModalOpen(false);

                        queryClient.invalidateQueries({
                            queryKey: ["daily-menu", "today"],
                        });
                    }}
                />
            )}
        </div>
    );
}

interface PrepareFoodModalProps {
    foods: Food[];
    isLoadingFoods: boolean;
    onClose: () => void;
    onSaved: () => void;
}

function PrepareFoodModal({
    foods,
    isLoadingFoods,
    onClose,
    onSaved,
}: PrepareFoodModalProps) {
    const [submitError, setSubmitError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PrepareFoodFormInput, undefined, PrepareFoodForm>({
        resolver: zodResolver(prepareFoodSchema),
    });

    const prepareMutation = useMutation({
        mutationFn: (data: PrepareFoodForm) =>
            prepareDailyFood(data),

        onSuccess: () => {
            setSubmitError("");
            onSaved();
        },

        onError: (error) => {
            setSubmitError(
                getErrorMessage(
                    error,
                    "Failed to prepare food."
                )
            );
        },
    });

    function onSubmit(data: PrepareFoodForm) {
        setSubmitError("");
        prepareMutation.mutate(data);
    }

    return (
        <Modal
            title="Prepare Food"
            onClose={onClose}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <Alert
                    type="error"
                    message={submitError}
                />

                {/* Food */}
                <div>
                    <label
                        htmlFor="food"
                        className="mb-1.5 block text-sm font-medium text-ink-800"
                    >
                        Food
                    </label>

                    <select
                        id="food"
                        {...register("foodId")}
                        disabled={
                            isLoadingFoods ||
                            prepareMutation.isPending
                        }
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:bg-stone-50"
                    >
                        <option value="">
                            {isLoadingFoods
                                ? "Loading foods..."
                                : "Select a food..."}
                        </option>

                        {foods.map((food) => (
                            <option
                                key={food.id}
                                value={food.id}
                            >
                                {food.name}
                            </option>
                        ))}
                    </select>

                    {errors.foodId && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.foodId.message}
                        </p>
                    )}

                    {!isLoadingFoods && foods.length === 0 && (
                        <p className="mt-1.5 text-xs text-ink-500">
                            Every food has already been prepared today,
                            or no foods exist yet.
                        </p>
                    )}
                </div>

                {/* Servings */}
                <div>
                    <label
                        htmlFor="preparedServings"
                        className="mb-1.5 block text-sm font-medium text-ink-800"
                    >
                        Servings
                    </label>

                    <input
                        id="preparedServings"
                        type="number"
                        min="1"
                        {...register("preparedServings")}
                        disabled={prepareMutation.isPending}
                        className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:bg-stone-50"
                    />

                    {errors.preparedServings && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.preparedServings.message}
                        </p>
                    )}

                    <p className="mt-1.5 text-xs text-ink-500">
                        This will deduct the ingredients required by the
                        recipe from inventory based on the number of
                        servings prepared.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={prepareMutation.isPending}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={
                            isLoadingFoods ||
                            foods.length === 0
                        }
                        isLoading={prepareMutation.isPending}
                    >
                        Prepare
                    </Button>
                </div>
            </form>
        </Modal>
    );
}