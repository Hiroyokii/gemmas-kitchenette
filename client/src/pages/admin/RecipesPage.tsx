import { useState, useEffect } from "react";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getFoods } from "../../services/food.service";
import { getIngredients } from "../../services/ingredient.service";
import { getRecipe, updateRecipe } from "../../services/recipe.service";

import type { Food } from "../../types/Food";
import type { Ingredient } from "../../types/Ingredient";

import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";

interface RecipeRow {
    ingredientId: number | "";
    quantity: number;
}

interface RecipeFormValues {
    rows: RecipeRow[];
}

export default function RecipesPage() {
    const queryClient = useQueryClient();

    const [selectedFoodId, setSelectedFoodId] = useState<number | "">("");
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");

    const foodsQuery = useQuery<Food[]>({
        queryKey: ["foods"],
        queryFn: () => getFoods(),
    });

    const ingredientsQuery = useQuery<Ingredient[]>({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const recipeQuery = useQuery({
        queryKey: ["recipes", selectedFoodId],
        queryFn: () => getRecipe(selectedFoodId as number),
        enabled: selectedFoodId !== "",
    });

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<RecipeFormValues>({
        defaultValues: {
            rows: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rows",
    });

    useEffect(() => {
        if (!selectedFoodId || !recipeQuery.data) {
            return;
        }

        reset({
            rows: recipeQuery.data.map((item) => ({
                ingredientId: item.ingredientId,
                quantity: Number(item.quantity),
            })),
        });
    }, [selectedFoodId, recipeQuery.data, reset]);  

    const saveMutation = useMutation({
        mutationFn: (data: RecipeFormValues) => {
            if (!selectedFoodId) {
                throw new Error("Please select a food.");
            }

            return updateRecipe(selectedFoodId, {
                ingredients: data.rows.map((row) => ({
                    ingredientId: row.ingredientId as number,
                    quantity: Number(row.quantity),
                })),
            });
        },

        onSuccess: () => {
            setSaveError("");
            setSaveSuccess("Recipe saved successfully.");

            queryClient.invalidateQueries({
                queryKey: ["recipes", selectedFoodId],
            });
        },

        onError: (error) => {
            setSaveSuccess("");
            setSaveError(
                getErrorMessage(error, "Failed to save recipe.")
            );
        },
    });

    function handleFoodChange(value: string) {
        const foodId = value ? Number(value) : "";

        setSelectedFoodId(foodId);
        setSaveError("");
        setSaveSuccess("");

        if (!foodId) {
            reset({ rows: [] });
        }
    }

    function onSubmit(data: RecipeFormValues) {
        setSaveError("");
        setSaveSuccess("");

        if (!selectedFoodId) {
            return;
        }

        if (data.rows.length === 0) {
            setSaveError("Add at least one ingredient.");
            return;
        }

        const ingredientIds = data.rows.map((row) => row.ingredientId);

        const hasDuplicates =
            new Set(ingredientIds).size !== ingredientIds.length;

        if (hasDuplicates) {
            setSaveError(
                "Each ingredient can only appear once in a recipe."
            );
            return;
        }

        if (
            data.rows.some(
                (row) => !row.ingredientId || !row.quantity
            )
        ) {
            setSaveError(
                "Every row needs an ingredient and a quantity."
            );
            return;
        }

        saveMutation.mutate(data);
    }

    const foods = foodsQuery.data ?? [];
    const ingredients = ingredientsQuery.data ?? [];

    const isLoadingRecipe =
        selectedFoodId !== "" && recipeQuery.isPending;

    const isLoadingInitialData =
        foodsQuery.isPending || ingredientsQuery.isPending;

    return (
        <div className="min-w-0 px-6 py-6 lg:px-8 lg:py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-ink-900">
                    Recipes
                </h1>

                <p className="mt-1 text-sm text-ink-500">
                    Manage the ingredients and quantities used for each food.
                </p>
            </div>

            {/* Food selector */}
            <div className="mb-6 max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <label
                    htmlFor="food"
                    className="mb-1.5 block text-sm font-medium text-ink-800"
                >
                    Food
                </label>

                <select
                    id="food"
                    value={selectedFoodId}
                    onChange={(event) =>
                        handleFoodChange(event.target.value)
                    }
                    disabled={isLoadingInitialData}
                    className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:bg-stone-50"
                >
                    <option value="">
                        {isLoadingInitialData
                            ? "Loading foods..."
                            : "Select a food..."}
                    </option>

                    {foods.map((food) => (
                        <option key={food.id} value={food.id}>
                            {food.name}
                        </option>
                    ))}
                </select>

                <p className="mt-2 text-xs text-ink-500">
                    Every recipe ingredient must already exist under
                    Ingredients.
                </p>

                {foodsQuery.isError && (
                    <p className="mt-2 text-xs text-red-600">
                        Failed to load foods.
                    </p>
                )}

                {ingredientsQuery.isError && (
                    <p className="mt-2 text-xs text-red-600">
                        Failed to load ingredients.
                    </p>
                )}
            </div>

            {/* Empty state */}
            {selectedFoodId === "" && (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-ink-500">
                        Select a food above to view or edit its recipe.
                    </p>
                </div>
            )}

            {/* Recipe loading */}
            {isLoadingRecipe && (
                <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-ink-500">
                        Loading recipe...
                    </p>
                </div>
            )}

            {/* Recipe loading error */}
            {selectedFoodId !== "" && recipeQuery.isError && (
                <Alert
                    type="error"
                    message={getErrorMessage(
                        recipeQuery.error,
                        "Failed to load recipe."
                    )}
                />
            )}

            {/* Recipe editor */}
            {selectedFoodId !== "" &&
                !recipeQuery.isPending &&
                !recipeQuery.isError && (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="max-w-4xl space-y-5"
                    >
                        <Alert
                            type="error"
                            message={saveError}
                        />

                        <Alert
                            type="success"
                            message={saveSuccess}
                        />

                        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                            {/* Card header */}
                            <div className="border-b border-stone-200 px-5 py-4">
                                <h2 className="text-base font-semibold text-ink-900">
                                    Recipe Ingredients
                                </h2>

                                <p className="mt-1 text-xs text-ink-500">
                                    Set the quantity required for one serving
                                    of this food.
                                </p>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-stone-100">
                                {fields.length === 0 && (
                                    <div className="px-5 py-8 text-center">
                                        <p className="text-sm text-ink-500">
                                            No ingredients added yet.
                                        </p>
                                    </div>
                                )}

                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end"
                                    >
                                        {/* Ingredient */}
                                        <div className="min-w-0">
                                            <label
                                                htmlFor={`ingredient-${field.id}`}
                                                className="mb-1.5 block text-xs font-medium text-ink-700"
                                            >
                                                Ingredient
                                            </label>

                                            <select
                                                id={`ingredient-${field.id}`}
                                                {...register(
                                                    `rows.${index}.ingredientId`,
                                                    {
                                                        valueAsNumber: true,
                                                    }
                                                )}
                                                className="w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                            >
                                                <option value="">
                                                    Select ingredient...
                                                </option>

                                                {ingredients.map((ingredient) => (
                                                    <option
                                                        key={ingredient.id}
                                                        value={ingredient.id}
                                                    >
                                                        {ingredient.name}{" "}
                                                        ({ingredient.unit?.name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label
                                                htmlFor={`quantity-${field.id}`}
                                                className="mb-1.5 block text-xs font-medium text-ink-700"
                                            >
                                                Quantity per serving
                                            </label>

                                            <input
                                                id={`quantity-${field.id}`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Quantity"
                                                {...register(
                                                    `rows.${index}.quantity`,
                                                    {
                                                        valueAsNumber: true,
                                                    }
                                                )}
                                                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                            />
                                        </div>

                                        {/* Remove */}
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => remove(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Add row */}
                            <div className="border-t border-stone-200 px-5 py-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            ingredientId: "",
                                            quantity: 0,
                                        })
                                    }
                                >
                                    + Add ingredient
                                </Button>
                            </div>
                        </div>

                        {/* Save */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                size="md"
                                isLoading={
                                    isSubmitting || saveMutation.isPending
                                }
                            >
                                {saveMutation.isPending
                                    ? "Saving..."
                                    : "Save Recipe"}
                            </Button>
                        </div>
                    </form>
                )}
        </div>
    );
}