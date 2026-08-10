import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import Modal from "../../components/admin/Modal";
import Alert from "../../components/admin/Alert";

export default function DailyMenuPage() {
    const [menu, setMenu] = useState<DailyMenu[]>([]);
    const [foods, setFoods] = useState<Food[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function loadMenu() {
        try {
            setLoading(true);

            const data = await getTodayMenuForAdmin();

            setMenu(data);
            setLoadError("");
        } catch (error) {
            setLoadError(
                getErrorMessage(error, "Failed to load today's menu.")
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMenu();

        getFoods().then(setFoods).catch(() => {});
    }, []);

    const preparedFoodIds = new Set(menu.map((m) => m.food.id));
    const availableFoods = foods.filter(
        (food) => !preparedFoodIds.has(food.id)
    );

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Today's Menu</h1>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded bg-orange-600 px-4 py-2 text-white text-sm font-medium hover:bg-orange-700"
                >
                    + Prepare Food
                </button>
            </div>

            <Alert type="error" message={loadError} />

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-3">Food</th>
                            <th className="p-3">Prepared</th>
                            <th className="p-3">Remaining</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td className="p-3" colSpan={4}>
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && menu.length === 0 && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={4}>
                                    Nothing prepared today yet.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            menu.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-3 font-medium">
                                        {item.food.name}
                                    </td>
                                    <td className="p-3">
                                        {item.preparedServings}
                                    </td>
                                    <td className="p-3">
                                        {item.remainingServings}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                item.remainingServings > 0
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-600"
                                            }`}
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

            {isModalOpen && (
                <PrepareFoodModal
                    foods={availableFoods}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        setIsModalOpen(false);
                        loadMenu();
                    }}
                />
            )}
        </div>
    );
}

function PrepareFoodModal({
    foods,
    onClose,
    onSaved,
}: {
    foods: Food[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<PrepareFoodFormInput, any, PrepareFoodForm>({
        resolver: zodResolver(prepareFoodSchema),
    });

    const [submitError, setSubmitError] = useState("");

    async function onSubmit(data: PrepareFoodForm) {
        setSubmitError("");

        try {
            await prepareDailyFood(data);
            onSaved();
        } catch (error) {
            setSubmitError(
                getErrorMessage(error, "Failed to prepare food.")
            );
        }
    }

    return (
        <Modal title="Prepare Food" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Alert type="error" message={submitError} />

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Food
                    </label>
                    <select
                        {...register("foodId")}
                        className="border rounded w-full p-2"
                    >
                        <option value="">Select a food...</option>
                        {foods.map((food) => (
                            <option key={food.id} value={food.id}>
                                {food.name}
                            </option>
                        ))}
                    </select>
                    {errors.foodId && (
                        <p className="text-red-500 text-sm">
                            {errors.foodId.message}
                        </p>
                    )}
                    {foods.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                            Every food has already been prepared today, or
                            no foods exist yet.
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Servings
                    </label>
                    <input
                        type="number"
                        {...register("preparedServings")}
                        className="border rounded w-full p-2"
                    />
                    {errors.preparedServings && (
                        <p className="text-red-500 text-sm">
                            {errors.preparedServings.message}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        This will deduct the ingredients this recipe needs
                        from stock. If stock is too low, saving will fail.
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded border text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting || foods.length === 0}
                        className="px-4 py-2 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Prepare"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}