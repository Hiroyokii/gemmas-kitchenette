import { useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    foodSchema,
    type FoodForm,
    type FoodFormInput,
} from "../../schemas/food.schema";

import {
    getFoods,
    createFood,
    updateFood,
} from "../../services/food.service";

import { getCategories } from "../../services/category.service";

import type { Food, Category } from "../../types/Food";

import { getErrorMessage } from "../../utils/getErrorMessage";

import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function FoodsPage() {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<Food | null>(null);

    const foodsQuery = useQuery({
        queryKey: [
            "foods",
            {
                search,
                categoryId: categoryFilter
                    ? Number(categoryFilter)
                    : undefined,
            },
        ],
        queryFn: () =>
            getFoods({
                search: search || undefined,
                categoryId: categoryFilter
                    ? Number(categoryFilter)
                    : undefined,
            }),
    });

    const categoriesQuery = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const foods = foodsQuery.data ?? [];
    const categories = categoriesQuery.data ?? [];

    const loading =
        foodsQuery.isPending || categoriesQuery.isPending;

    const loadError =
        foodsQuery.error || categoriesQuery.error
            ? getErrorMessage(
                  foodsQuery.error || categoriesQuery.error,
                  "Failed to load foods."
              )
            : "";

    function openCreateModal() {
        setEditingFood(null);
        setIsModalOpen(true);
    }

    function openEditModal(food: Food) {
        setEditingFood(food);
        setIsModalOpen(true);
    }

    function handleSaved() {
        setIsModalOpen(false);

        queryClient.invalidateQueries({
            queryKey: ["foods"],
        });
    }

    return (
        <div className="min-h-full bg-stone-50 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                            Foods
                        </h1>

                        <p className="mt-1 text-sm text-stone-500">
                            Manage the food items available for ordering.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={openCreateModal}
                    >
                        + Add Food
                    </Button>
                </div>

                {/* Error */}
                <Alert
                    type="error"
                    message={loadError}
                />

                {/* Filters */}
                <div className="mb-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                        <Input
                            type="text"
                            label="Search foods"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        <div className="w-full sm:min-w-48">
                            <label
                                htmlFor="category-filter"
                                className="mb-1.5 block text-sm font-medium text-stone-800"
                            >
                                Category
                            </label>

                            <select
                                id="category-filter"
                                value={categoryFilter}
                                onChange={(event) =>
                                    setCategoryFilter(event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                            >
                                <option value="">
                                    All categories
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Food table */}
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm">
                            <thead className="border-b border-stone-200 bg-stone-50 text-left">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-stone-700">
                                        Name
                                    </th>

                                    <th className="px-5 py-3 font-semibold text-stone-700">
                                        Category
                                    </th>

                                    <th className="px-5 py-3 font-semibold text-stone-700">
                                        Price
                                    </th>

                                    <th className="px-5 py-3 font-semibold text-stone-700">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right font-semibold text-stone-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-8 text-center text-sm text-stone-500"
                                        >
                                            Loading foods...
                                        </td>
                                    </tr>
                                )}

                                {!loading && foods.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-8 text-center text-sm text-stone-500"
                                        >
                                            No foods found.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    foods.map((food) => (
                                        <tr
                                            key={food.id}
                                            className="border-t border-stone-100 transition-colors hover:bg-stone-50"
                                        >
                                            <td className="px-5 py-4 font-medium text-stone-900">
                                                {food.name}
                                            </td>

                                            <td className="px-5 py-4 text-stone-600">
                                                {food.category?.name ?? "—"}
                                            </td>

                                            <td className="px-5 py-4 font-medium text-stone-900">
                                                ₱{food.price}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={[
                                                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                                                        food.isAvailable
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-stone-100 text-stone-600",
                                                    ].join(" ")}
                                                >
                                                    {food.isAvailable
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(food)
                                                    }
                                                    className="font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <FoodFormModal
                        food={editingFood}
                        categories={categories}
                        onClose={() => setIsModalOpen(false)}
                        onSaved={handleSaved}
                    />
                )}
            </div>
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

    const [submitError, setSubmitError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FoodFormInput, undefined, FoodForm>({
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

    const saveMutation = useMutation({
        mutationFn: async (data: FoodForm) => {
            if (isEditing && food) {
                return updateFood(food.id, {
                    ...data,
                    imageUrl: data.imageUrl || undefined,
                });
            }

            return createFood({
                ...data,
                imageUrl: data.imageUrl || undefined,
            });
        },

        onSuccess: () => {
            setSubmitError("");
            onSaved();
        },

        onError: (error) => {
            setSubmitError(
                getErrorMessage(error, "Failed to save food.")
            );
        },
    });

    function onSubmit(data: FoodForm) {
        setSubmitError("");
        saveMutation.mutate(data);
    }

    return (
        <Modal
            title={isEditing ? "Edit Food" : "Add Food"}
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

                <Input
                    label="Name"
                    placeholder="Food name"
                    error={errors.name?.message}
                    {...register("name")}
                />

                <div>
                    <label
                        htmlFor="description"
                        className="mb-1.5 block text-sm font-medium text-stone-800"
                    >
                        Description
                    </label>

                    <textarea
                        id="description"
                        rows={3}
                        placeholder="Describe the food..."
                        {...register("description")}
                        className="w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />

                    {errors.description && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        type="number"
                        step="0.01"
                        label="Price (₱)"
                        error={errors.price?.message}
                        {...register("price")}
                    />

                    <div>
                        <label
                            htmlFor="food-category"
                            className="mb-1.5 block text-sm font-medium text-stone-800"
                        >
                            Category
                        </label>

                        <select
                            id="food-category"
                            {...register("categoryId")}
                            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        >
                            <option value="">
                                Select category...
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {errors.categoryId && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.categoryId.message}
                            </p>
                        )}
                    </div>
                </div>

                <Input
                    label="Image URL (optional)"
                    placeholder="https://..."
                    error={errors.imageUrl?.message}
                    {...register("imageUrl")}
                />

                {isEditing && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                        <input
                            type="checkbox"
                            {...register("isAvailable")}
                            className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500"
                        />

                        Available for ordering
                    </label>
                )}

                <div className="flex justify-end gap-3 border-t border-stone-200 pt-5">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={saveMutation.isPending}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        isLoading={saveMutation.isPending}
                    >
                        {saveMutation.isPending
                            ? "Saving..."
                            : "Save"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}