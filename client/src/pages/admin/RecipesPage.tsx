import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { getFoods } from "../../services/food.service";
import { getIngredients } from "../../services/ingredient.service";
import { getRecipe, updateRecipe } from "../../services/recipe.service";
import type { Food } from "../../types/Food";
import type { Ingredient } from "../../types/Ingredient";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Alert from "../../components/admin/Alert";

interface RecipeRow {
    ingredientId: number | "";
    quantity: number;
}

interface RecipeFormValues {
    rows: RecipeRow[];
}

export default function RecipesPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [selectedFoodId, setSelectedFoodId] = useState<number | "">("");

    const [loadingRecipe, setLoadingRecipe] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<RecipeFormValues>({
        defaultValues: { rows: [] },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rows",
    });

    useEffect(() => {
        getFoods().then(setFoods).catch(() => {});
        getIngredients().then(setIngredients).catch(() => {});
    }, []);

    useEffect(() => {
        if (!selectedFoodId) {
            reset({ rows: [] });
            return;
        }

        async function loadRecipe() {
            setLoadingRecipe(true);
            setLoadError("");
            setSaveSuccess("");

            try {
                const recipe = await getRecipe(selectedFoodId as number);

                reset({
                    rows: recipe.map((item) => ({
                        ingredientId: item.ingredientId,
                        quantity: Number(item.quantity),
                    })),
                });
            } catch (error) {
                setLoadError(
                    getErrorMessage(error, "Failed to load recipe.")
                );
            } finally {
                setLoadingRecipe(false);
            }
        }

        loadRecipe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFoodId]);

    async function onSubmit(data: RecipeFormValues) {
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
            setSaveError("Each ingredient can only appear once in a recipe.");
            return;
        }

        if (data.rows.some((row) => !row.ingredientId || !row.quantity)) {
            setSaveError("Every row needs an ingredient and a quantity.");
            return;
        }

        try {
            await updateRecipe(selectedFoodId as number, {
                ingredients: data.rows.map((row) => ({
                    ingredientId: row.ingredientId as number,
                    quantity: Number(row.quantity),
                })),
            });

            setSaveSuccess("Recipe saved.");
        } catch (error) {
            setSaveError(getErrorMessage(error, "Failed to save recipe."));
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Recipes</h1>

            <div className="mb-6 max-w-sm">
                <label className="block text-sm font-medium mb-1">
                    Food
                </label>
                <select
                    value={selectedFoodId}
                    onChange={(e) =>
                        setSelectedFoodId(
                            e.target.value ? Number(e.target.value) : ""
                        )
                    }
                    className="border rounded w-full p-2"
                >
                    <option value="">Select a food...</option>
                    {foods.map((food) => (
                        <option key={food.id} value={food.id}>
                            {food.name}
                        </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                    Every recipe ingredient must already exist under
                    Ingredients.
                </p>
            </div>

            {!selectedFoodId && (
                <p className="text-gray-500">
                    Select a food above to view or edit its recipe.
                </p>
            )}

            {selectedFoodId !== "" && loadingRecipe && (
                <p>Loading recipe...</p>
            )}

            <Alert type="error" message={loadError} />

            {selectedFoodId !== "" && !loadingRecipe && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Alert type="error" message={saveError} />
                    <Alert type="success" message={saveSuccess} />

                    <div className="border rounded-lg divide-y">
                        {fields.length === 0 && (
                            <p className="p-4 text-gray-500 text-sm">
                                No ingredients added yet.
                            </p>
                        )}

                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="flex items-center gap-3 p-3"
                            >
                                <select
                                    {...register(
                                        `rows.${index}.ingredientId`,
                                        { valueAsNumber: true }
                                    )}
                                    className="border rounded p-2 flex-1"
                                >
                                    <option value="">
                                        Select ingredient...
                                    </option>
                                    {ingredients.map((ing) => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.name} ({ing.unit?.name})
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Quantity"
                                    {...register(`rows.${index}.quantity`, {
                                        valueAsNumber: true,
                                    })}
                                    className="border rounded p-2 w-32"
                                />

                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-600 hover:underline text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            append({ ingredientId: "", quantity: 0 })
                        }
                        className="text-orange-600 text-sm font-medium hover:underline"
                    >
                        + Add ingredient row
                    </button>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Recipe"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
