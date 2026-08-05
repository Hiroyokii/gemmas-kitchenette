import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { foodSchema, type FoodForm, type FoodFormInput } from "../../schemas/food.schema";
import {
    getFoods,
    createFood,
    updateFood,
} from "../../services/food.service";
import { getCategories } from "../../services/category.service";
import type { Food, Category } from "../../types/Food";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Modal from "../../components/admin/Modal";
import Alert from "../../components/admin/Alert";

export default function FoodsPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<Food | null>(null);

    async function loadFoods() {
        try {
            setLoading(true);

            const data = await getFoods({
                search: search || undefined,
                categoryId: categoryFilter
                    ? Number(categoryFilter)
                    : undefined,
            });

            setFoods(data);
            setLoadError("");
        } catch (error) {
            setLoadError(getErrorMessage(error, "Failed to load foods."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch(() => {
            });
    }, []);

    useEffect(() => {
        const timeout = setTimeout(loadFoods, 300);
        return () => clearTimeout(timeout);
    }, [search, categoryFilter]);

    function openCreateModal() {
        setEditingFood(null);
        setIsModalOpen(true);
    }

    function openEditModal(food: Food) {
        setEditingFood(food);
        setIsModalOpen(true);
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Foods</h1>

                <button
                    onClick={openCreateModal}
                    className="rounded bg-orange-600 px-4 py-2 text-white text-sm font-medium hover:bg-orange-700"
                >
                    + Add Food
                </button>
            </div>

            <div className="mb-4 flex gap-3">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 text-sm w-64"
                />

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <Alert type="error" message={loadError} />

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Status</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td className="p-3" colSpan={5}>
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && foods.length === 0 && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={5}>
                                    No foods found.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            foods.map((food) => (
                                <tr key={food.id} className="border-t">
                                    <td className="p-3 font-medium">
                                        {food.name}
                                    </td>
                                    <td className="p-3">
                                        {food.category?.name ?? "—"}
                                    </td>
                                    <td className="p-3">₱{food.price}</td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                food.isAvailable
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-600"
                                            }`}
                                        >
                                            {food.isAvailable
                                                ? "Available"
                                                : "Unavailable"}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => openEditModal(food)}
                                            className="text-orange-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <FoodFormModal
                    food={editingFood}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        setIsModalOpen(false);
                        loadFoods();
                    }}
                />
            )}
        </div>
    );
}

function FoodFormModal({
    food,
    categories,
    onClose,
    onSaved,
}: {
    food: Food | null;
    categories: Category[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEditing = Boolean(food);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FoodFormInput, any, FoodForm>({
        resolver: zodResolver(foodSchema),
        defaultValues: food
            ? {
                  name: food.name,
                  description: food.description,
                  price: food.price,
                  categoryId: food.categoryId,
                  imageUrl: food.imageUrl ?? "",
                  isAvailable: food.isAvailable,
              }
            : {
                  name: "",
                  description: "",
                  price: 0,
                  categoryId: undefined,
                  imageUrl: "",
                  isAvailable: true,
              },
    });

    const [submitError, setSubmitError] = useState("");

    async function onSubmit(data: FoodForm) {
        setSubmitError("");

        try {
            if (isEditing && food) {
                await updateFood(food.id, {
                    ...data,
                    imageUrl: data.imageUrl || undefined,
                });
            } else {
                await createFood({
                    ...data,
                    imageUrl: data.imageUrl || undefined,
                });
            }

            onSaved();
        } catch (error) {
            setSubmitError(getErrorMessage(error, "Failed to save food."));
        }
    }

    return (
        <Modal
            title={isEditing ? "Edit Food" : "Add Food"}
            onClose={onClose}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Alert type="error" message={submitError} />

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Name
                    </label>
                    <input
                        {...register("name")}
                        className="border rounded w-full p-2"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        className="border rounded w-full p-2"
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Price (₱)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("price")}
                            className="border rounded w-full p-2"
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm">
                                {errors.price.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Category
                        </label>
                        <select
                            {...register("categoryId")}
                            className="border rounded w-full p-2"
                        >
                            <option value="">Select...</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <p className="text-red-500 text-sm">
                                {errors.categoryId.message}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Image URL (optional)
                    </label>
                    <input
                        {...register("imageUrl")}
                        className="border rounded w-full p-2"
                    />
                </div>

                {isEditing && (
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            {...register("isAvailable")}
                        />
                        Available for ordering
                    </label>
                )}

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
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
