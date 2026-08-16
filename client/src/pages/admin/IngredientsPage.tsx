import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    ingredientSchema,
    type IngredientForm,
    type IngredientFormInput,
} from "../../schemas/ingredient.schema";
import {
    getIngredients,
    getUnits,
    createIngredient,
    updateIngredient,
} from "../../services/ingredient.service";
import type { Ingredient, Unit } from "../../types/Ingredient";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Modal from "../../components/admin/Modal";
import Alert from "../../components/admin/Alert";

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] =
        useState<Ingredient | null>(null);

    async function loadIngredients() {
        try {
            setLoading(true);

            const data = await getIngredients();

            setIngredients(data);
            setLoadError("");
        } catch (error) {
            setLoadError(
                getErrorMessage(error, "Failed to load ingredients.")
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let ignore = false;

        getIngredients()
            .then((data) => {
                if (ignore) return;
                setIngredients(data);
                setLoadError("");
            })
            .catch((error) => {
                if (ignore) return;
                setLoadError(
                    getErrorMessage(error, "Failed to load ingredients.")
                );
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        getUnits()
            .then((data) => {
                if (!ignore) setUnits(data);
            })
            .catch(() => {
                // Non-fatal: list still loads, form just won't have options.
            });

        return () => {
            ignore = true;
        };
    }, []);

    function openCreateModal() {
        setEditingIngredient(null);
        setIsModalOpen(true);
    }

    function openEditModal(ingredient: Ingredient) {
        setEditingIngredient(ingredient);
        setIsModalOpen(true);
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Ingredients</h1>

                <button
                    onClick={openCreateModal}
                    className="rounded bg-orange-600 px-4 py-2 text-white text-sm font-medium hover:bg-orange-700"
                >
                    + Add Ingredient
                </button>
            </div>

            <Alert type="error" message={loadError} />

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Unit</th>
                            <th className="p-3">Current Stock</th>
                            <th className="p-3">Minimum Stock</th>
                            <th className="p-3">Cost / Unit</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td className="p-3" colSpan={6}>
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && ingredients.length === 0 && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={6}>
                                    No ingredients yet.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            ingredients.map((ingredient) => {
                                const isLow =
                                    Number(ingredient.currentStock) <
                                    Number(ingredient.minimumStock);

                                return (
                                    <tr
                                        key={ingredient.id}
                                        className="border-t"
                                    >
                                        <td className="p-3 font-medium">
                                            {ingredient.name}
                                        </td>
                                        <td className="p-3">
                                            {ingredient.unit?.name ?? "—"}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={
                                                    isLow
                                                        ? "text-red-600 font-semibold"
                                                        : ""
                                                }
                                            >
                                                {ingredient.currentStock}
                                            </span>
                                            {isLow && (
                                                <span className="ml-2 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs">
                                                    Low stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {ingredient.minimumStock}
                                        </td>
                                        <td className="p-3">
                                            ₱{ingredient.costPerUnit}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() =>
                                                    openEditModal(ingredient)
                                                }
                                                className="text-orange-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {units.length === 0 && !loading && (
                <p className="mt-3 text-sm text-gray-500">
                    No units are set up yet. Units come from the database
                    seed (Kilogram, Liter, Piece).
                </p>
            )}

            {isModalOpen && (
                <IngredientFormModal
                    ingredient={editingIngredient}
                    units={units}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        setIsModalOpen(false);
                        loadIngredients();
                    }}
                />
            )}
        </div>
    );
}

function IngredientFormModal({
    ingredient,
    units,
    onClose,
    onSaved,
}: {
    ingredient: Ingredient | null;
    units: Unit[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEditing = Boolean(ingredient);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IngredientFormInput, unknown, IngredientForm>({
        resolver: zodResolver(ingredientSchema),
        defaultValues: ingredient
            ? {
                  name: ingredient.name,
                  unitId: ingredient.unitId,
                  minimumStock: ingredient.minimumStock,
                  costPerUnit: ingredient.costPerUnit,
              }
            : {
                  name: "",
                  unitId: undefined,
                  minimumStock: 0,
                  costPerUnit: 0,
              },
    });

    const [submitError, setSubmitError] = useState("");

    async function onSubmit(data: IngredientForm) {
        setSubmitError("");

        try {
            if (isEditing && ingredient) {
                await updateIngredient(ingredient.id, data);
            } else {
                await createIngredient(data);
            }

            onSaved();
        } catch (error) {
            setSubmitError(
                getErrorMessage(error, "Failed to save ingredient.")
            );
        }
    }

    return (
        <Modal
            title={isEditing ? "Edit Ingredient" : "Add Ingredient"}
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
                        Unit
                    </label>
                    <select
                        {...register("unitId")}
                        className="border rounded w-full p-2"
                    >
                        <option value="">Select...</option>
                        {units.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    {errors.unitId && (
                        <p className="text-red-500 text-sm">
                            {errors.unitId.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Minimum Stock
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("minimumStock")}
                            className="border rounded w-full p-2"
                        />
                        {errors.minimumStock && (
                            <p className="text-red-500 text-sm">
                                {errors.minimumStock.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Cost per Unit (₱)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("costPerUnit")}
                            className="border rounded w-full p-2"
                        />
                        {errors.costPerUnit && (
                            <p className="text-red-500 text-sm">
                                {errors.costPerUnit.message}
                            </p>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <p className="text-xs text-gray-500">
                        Current stock ({ingredient?.currentStock}) can only
                        be changed by recording a Purchase or preparing the
                        Daily Menu — not edited directly here.
                    </p>
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
