import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { getPurchases, createPurchase } from "../../services/purchase.service";
import { getIngredients } from "../../services/ingredient.service";
import type { Purchase } from "../../types/Purchase";
import type { Ingredient } from "../../types/Ingredient";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Modal from "../../components/admin/Modal";
import Alert from "../../components/admin/Alert";

interface PurchaseRow {
    ingredientId: number | "";
    quantity: number;
    unitCost: number;
}

interface PurchaseFormValues {
    rows: PurchaseRow[];
}

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function loadPurchases() {
        try {
            setLoading(true);

            const data = await getPurchases();

            setPurchases(data);
            setLoadError("");
        } catch (error) {
            setLoadError(
                getErrorMessage(error, "Failed to load purchases.")
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPurchases();

        getIngredients().then(setIngredients).catch(() => {});
    }, []);

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Purchases</h1>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded bg-orange-600 px-4 py-2 text-white text-sm font-medium hover:bg-orange-700"
                >
                    + Record Purchase
                </button>
            </div>

            <Alert type="error" message={loadError} />

            <div className="space-y-4">
                {loading && <p>Loading...</p>}

                {!loading && purchases.length === 0 && (
                    <p className="text-gray-500">No purchases recorded yet.</p>
                )}

                {!loading &&
                    purchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="border rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className="font-medium">
                                        {new Date(
                                            purchase.createdAt
                                        ).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Recorded by{" "}
                                        {purchase.createdBy.firstName}{" "}
                                        {purchase.createdBy.lastName}
                                    </p>
                                </div>

                                <p className="font-semibold">
                                    ₱{Number(purchase.totalCost).toFixed(2)}
                                </p>
                            </div>

                            <table className="w-full text-sm mt-2">
                                <thead className="text-left text-gray-500">
                                    <tr>
                                        <th className="py-1">Ingredient</th>
                                        <th className="py-1">Quantity</th>
                                        <th className="py-1">Unit Cost</th>
                                        <th className="py-1">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchase.purchaseItems.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="py-1">
                                                {item.ingredient.name}
                                            </td>
                                            <td className="py-1">
                                                {item.quantity}{" "}
                                                {item.ingredient.unit?.name}
                                            </td>
                                            <td className="py-1">
                                                ₱{Number(item.unitCost).toFixed(2)}
                                            </td>
                                            <td className="py-1">
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
                    ))}
            </div>

            {isModalOpen && (
                <PurchaseFormModal
                    ingredients={ingredients}
                    onClose={() => setIsModalOpen(false)}
                    onSaved={() => {
                        setIsModalOpen(false);
                        loadPurchases();
                    }}
                />
            )}
        </div>
    );
}

function PurchaseFormModal({
    ingredients,
    onClose,
    onSaved,
}: {
    ingredients: Ingredient[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const { control, register, handleSubmit, watch, formState } =
        useForm<PurchaseFormValues>({
            defaultValues: {
                rows: [{ ingredientId: "", quantity: 0, unitCost: 0 }],
            },
        });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rows",
    });

    const rows = watch("rows");
    const total = rows.reduce(
        (sum, row) =>
            sum + (Number(row.quantity) || 0) * (Number(row.unitCost) || 0),
        0
    );

    const [submitError, setSubmitError] = useState("");

    async function onSubmit(data: PurchaseFormValues) {
        setSubmitError("");

        if (data.rows.length === 0) {
            setSubmitError("Add at least one item.");
            return;
        }

        if (
            data.rows.some(
                (row) => !row.ingredientId || !row.quantity || !row.unitCost
            )
        ) {
            setSubmitError(
                "Every row needs an ingredient, quantity, and cost."
            );
            return;
        }

        try {
            await createPurchase({
                items: data.rows.map((row) => ({
                    ingredientId: row.ingredientId as number,
                    quantity: Number(row.quantity),
                    unitCost: Number(row.unitCost),
                })),
            });

            onSaved();
        } catch (error) {
            setSubmitError(
                getErrorMessage(error, "Failed to record purchase.")
            );
        }
    }

    return (
        <Modal title="Record Purchase" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Alert type="error" message={submitError} />

                <div className="border rounded-lg divide-y">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex items-center gap-2 p-3"
                        >
                            <select
                                {...register(
                                    `rows.${index}.ingredientId`,
                                    { valueAsNumber: true }
                                )}
                                className="border rounded p-2 flex-1"
                            >
                                <option value="">Ingredient...</option>
                                {ingredients.map((ing) => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                step="0.01"
                                placeholder="Qty"
                                {...register(`rows.${index}.quantity`, {
                                    valueAsNumber: true,
                                })}
                                className="border rounded p-2 w-20"
                            />

                            <input
                                type="number"
                                step="0.01"
                                placeholder="Unit cost"
                                {...register(`rows.${index}.unitCost`, {
                                    valueAsNumber: true,
                                })}
                                className="border rounded p-2 w-24"
                            />

                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-600 hover:underline text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        append({ ingredientId: "", quantity: 0, unitCost: 0 })
                    }
                    className="text-orange-600 text-sm font-medium hover:underline"
                >
                    + Add item
                </button>

                <div className="text-right font-semibold">
                    Total: ₱{total.toFixed(2)}
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
                        disabled={formState.isSubmitting}
                        className="px-4 py-2 rounded bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                    >
                        {formState.isSubmitting ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}