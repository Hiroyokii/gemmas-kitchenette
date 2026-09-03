import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { getPurchases, createPurchase } from "../../services/purchase.service";
import { getIngredients } from "../../services/ingredient.service";

import type { Purchase } from "../../types/Purchase";
import type { Ingredient } from "../../types/Ingredient";

import { getErrorMessage } from "../../utils/getErrorMessage";

import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface PurchaseRow {
    ingredientId: number | "";
    quantity: number;
    unitCost: number;
}

interface PurchaseFormValues {
    rows: PurchaseRow[];
}

export default function PurchasesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const purchasesQuery = useQuery<Purchase[]>({
        queryKey: ["purchases"],
        queryFn: getPurchases,
    });

    const ingredientsQuery = useQuery<Ingredient[]>({
        queryKey: ["ingredients"],
        queryFn: getIngredients,
    });

    const purchases = purchasesQuery.data ?? [];
    const ingredients = ingredientsQuery.data ?? [];

    const loadError = purchasesQuery.error
        ? getErrorMessage(
              purchasesQuery.error,
              "Failed to load purchases."
          )
        : "";

    function handleSaved() {
        setIsModalOpen(false);

        queryClient.invalidateQueries({
            queryKey: ["purchases"],
        });

        queryClient.invalidateQueries({
            queryKey: ["ingredients"],
        });
    }

    return (
        <div className="min-w-0 px-6 py-6 lg:px-8 lg:py-8">
            {/* Header */}
            <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                        Purchases
                    </h1>

                    <p className="mt-1 text-sm text-ink-500">
                        Record ingredient purchases and monitor your spending.
                    </p>
                </div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="shrink-0"
                >
                    + Record Purchase
                </Button>
            </div>

            <Alert type="error" message={loadError} />

            {/* Loading */}
            {purchasesQuery.isPending && (
                <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
                    <p className="text-sm text-ink-500">
                        Loading purchases...
                    </p>
                </div>
            )}

            {/* Empty State */}
            {!purchasesQuery.isPending && purchases.length === 0 && (
                <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center shadow-sm">
                    <p className="font-medium text-ink-800">
                        No purchases recorded yet.
                    </p>

                    <p className="mt-1 text-sm text-ink-500">
                        Record your first ingredient purchase to see it here.
                    </p>
                </div>
            )}

            {/* Purchases */}
            {!purchasesQuery.isPending && purchases.length > 0 && (
                <div className="space-y-4">
                    {purchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                        >
                            {/* Purchase Header */}
                            <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-6 py-5">
                                <div>
                                    <p className="font-semibold text-ink-900">
                                        {new Date(
                                            purchase.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    <p className="mt-1 text-xs text-ink-500">
                                        Recorded by{" "}
                                        {purchase.createdBy.firstName}{" "}
                                        {purchase.createdBy.lastName}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-ink-500">
                                        Total Cost
                                    </p>

                                    <p className="mt-0.5 text-lg font-bold text-ink-900">
                                        ₱
                                        {Number(purchase.totalCost).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Purchase Items */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-sm">
                                    <thead className="bg-stone-50/70">
                                        <tr className="border-b border-stone-200 text-left">
                                            <th className="px-6 py-3 font-semibold text-ink-700">
                                                Ingredient
                                            </th>

                                            <th className="px-6 py-3 font-semibold text-ink-700">
                                                Quantity
                                            </th>

                                            <th className="px-6 py-3 font-semibold text-ink-700">
                                                Unit Cost
                                            </th>

                                            <th className="px-6 py-3 text-right font-semibold text-ink-700">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {purchase.purchaseItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-stone-100 last:border-0"
                                            >
                                                <td className="px-6 py-4 font-medium text-ink-900">
                                                    {item.ingredient.name}
                                                </td>

                                                <td className="px-6 py-4 text-ink-600">
                                                    {item.quantity}{" "}
                                                    {item.ingredient.unit?.name}
                                                </td>

                                                <td className="px-6 py-4 text-ink-600">
                                                    ₱
                                                    {Number(
                                                        item.unitCost
                                                    ).toFixed(2)}
                                                </td>

                                                <td className="px-6 py-4 text-right font-medium text-ink-800">
                                                    ₱
                                                    {(
                                                        Number(item.quantity) *
                                                        Number(item.unitCost)
                                                    ).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <PurchaseFormModal
                    ingredients={ingredients}
                    ingredientsLoading={ingredientsQuery.isPending}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

function PurchaseFormModal({
    ingredients,
    ingredientsLoading,
    onClose,
    onSaved,
}: {
    ingredients: Ingredient[];
    ingredientsLoading: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [submitError, setSubmitError] = useState("");

    const {
        control,
        register,
        handleSubmit,
    } = useForm<PurchaseFormValues>({
        defaultValues: {
            rows: [
                {
                    ingredientId: "",
                    quantity: 0,
                    unitCost: 0,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rows",
    });

    const rows = useWatch({
        control,
        name: "rows",
    });

    const total = rows.reduce(
        (sum, row) =>
            sum +
            (Number(row.quantity) || 0) *
                (Number(row.unitCost) || 0),
        0
    );

    const saveMutation = useMutation({
        mutationFn: (data: PurchaseFormValues) =>
            createPurchase({
                items: data.rows.map((row) => ({
                    ingredientId: row.ingredientId as number,
                    quantity: Number(row.quantity),
                    unitCost: Number(row.unitCost),
                })),
            }),

        onSuccess: () => {
            setSubmitError("");
            onSaved();
        },

        onError: (error) => {
            setSubmitError(
                getErrorMessage(
                    error,
                    "Failed to record purchase."
                )
            );
        },
    });

    function onSubmit(data: PurchaseFormValues) {
        setSubmitError("");

        if (data.rows.length === 0) {
            setSubmitError("Add at least one item.");
            return;
        }

        if (
            data.rows.some(
                (row) =>
                    !row.ingredientId ||
                    !row.quantity ||
                    !row.unitCost
            )
        ) {
            setSubmitError(
                "Every row needs an ingredient, quantity, and cost."
            );
            return;
        }

        saveMutation.mutate(data);
    }

    return (
        <Modal 
            title="Record Purchase" 
            onClose={onClose}
            size="lg"
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <Alert
                    type="error"
                    message={submitError}
                />

                {/* Purchase Items */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-ink-800">
                                Purchase Items
                            </h3>

                            <p className="mt-0.5 text-xs text-ink-500">
                                Add the ingredients included in this purchase.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-stone-200">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="border-b border-stone-100 p-4 last:border-0"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(160px,1fr)_110px_130px_auto] sm:items-end">
                                    {/* Ingredient */}
                                    <div>
                                        <label
                                            htmlFor={`ingredient-${field.id}`}
                                            className="mb-1.5 block text-xs font-medium text-ink-700"
                                        >
                                            Ingredient
                                        </label>

                                        <select
                                            id={`ingredient-${field.id}`}
                                            disabled={ingredientsLoading}
                                            {...register(
                                                `rows.${index}.ingredientId`,
                                                {
                                                    valueAsNumber: true,
                                                }
                                            )}
                                            className={[
                                                "w-full rounded-lg border border-stone-200",
                                                "bg-white px-3 py-2 text-sm text-ink-900",
                                                "transition-colors",
                                                "focus:border-orange-500",
                                                "focus:outline-none",
                                                "focus:ring-2 focus:ring-orange-500/20",
                                                "disabled:cursor-not-allowed",
                                                "disabled:bg-stone-50",
                                            ].join(" ")}
                                        >
                                            <option value="">
                                                {ingredientsLoading
                                                    ? "Loading..."
                                                    : "Select ingredient..."}
                                            </option>

                                            {ingredients.map((ingredient) => (
                                                <option
                                                    key={ingredient.id}
                                                    value={ingredient.id}
                                                >
                                                    {ingredient.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Quantity */}
                                    <Input
                                        label="Quantity"
                                        type="number"
                                        step="0.01"
                                        placeholder="0"
                                        {...register(
                                            `rows.${index}.quantity`,
                                            {
                                                valueAsNumber: true,
                                            }
                                        )}
                                    />

                                    {/* Unit Cost */}
                                    <Input
                                        label="Unit Cost"
                                        type="number"
                                        step="0.01"
                                        placeholder="₱0.00"
                                        {...register(
                                            `rows.${index}.unitCost`,
                                            {
                                                valueAsNumber: true,
                                            }
                                        )}
                                    />

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                        className="h-10 rounded-lg px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-stone-300"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Item */}
                <button
                    type="button"
                    onClick={() =>
                        append({
                            ingredientId: "",
                            quantity: 0,
                            unitCost: 0,
                        })
                    }
                    className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
                >
                    + Add another item
                </button>

                {/* Total */}
                <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                    <span className="text-sm font-medium text-ink-600">
                        Total Purchase Cost
                    </span>

                    <span className="text-lg font-bold text-ink-900">
                        ₱{total.toFixed(2)}
                    </span>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
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
                            : "Save Purchase"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}