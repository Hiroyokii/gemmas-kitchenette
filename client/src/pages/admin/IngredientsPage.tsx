import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

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
import { getExpirationAlerts } from "../../services/purchase.service";

import type { Ingredient, Unit } from "../../types/Ingredient";
import type { ExpirationAlert } from "../../services/purchase.service";
import { getErrorMessage } from "../../utils/getErrorMessage";

import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] =
        useState<Ingredient | null>(null);
    const expirationAlertsQuery = useQuery<ExpirationAlert[]>({
        queryKey: ["expiration-alerts"],
        queryFn: getExpirationAlerts,
    });

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
        <div className="px-6 pt-6 pb-8 lg:px-8 lg:pt-8">
            {/* Page Header */}
            <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-ink-900">
                        Ingredients
                    </h1>

                    <p className="mt-1 text-sm text-ink-500">
                        Manage ingredients, stock levels, and costs.
                    </p>
                </div>

                <Button
                    onClick={openCreateModal}
                    className="shrink-0"
                >
                    + Add Ingredient
                </Button>
            </div>

            <Alert type="error" message={loadError} />
            <Alert
                type="error"
                message={expirationAlertsQuery.error
                    ? getErrorMessage(
                        expirationAlertsQuery.error,
                        "Failed to load expiration alerts."
                    )
                    : ""}
            />

            <ExpirationAlerts alerts={expirationAlertsQuery.data ?? []} />

            {/* Ingredients Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-sm">
                        <thead className="border-b border-stone-200 bg-stone-50">
                            <tr className="text-left">
                                <th className="px-6 py-4 font-semibold text-ink-800">
                                    Name
                                </th>

                                <th className="px-6 py-4 font-semibold text-ink-800">
                                    Unit
                                </th>

                                <th className="px-6 py-4 font-semibold text-ink-800">
                                    Current Stock
                                </th>

                                <th className="px-6 py-4 font-semibold text-ink-800">
                                    Minimum Stock
                                </th>

                                <th className="px-6 py-4 font-semibold text-ink-800">
                                    Cost / Unit
                                </th>

                                <th className="px-6 py-4 font-semibold text-ink-800">
                                    Expiration
                                </th>

                                <th className="px-6 py-4 text-right font-semibold text-ink-800">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        className="px-6 py-10 text-center text-ink-500"
                                        colSpan={7}
                                    >
                                        Loading ingredients...
                                    </td>
                                </tr>
                            )}

                            {!loading && ingredients.length === 0 && (
                                <tr>
                                    <td
                                        className="px-6 py-10 text-center text-ink-500"
                                        colSpan={7}
                                    >
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
                                            className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/70"
                                        >
                                            <td className="px-6 py-4 font-medium text-ink-900">
                                                {ingredient.name}
                                            </td>

                                            <td className="px-6 py-4 text-ink-600">
                                                {ingredient.unit?.name ?? "—"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={
                                                            isLow
                                                                ? "font-semibold text-red-600"
                                                                : "text-ink-800"
                                                        }
                                                    >
                                                        {
                                                            ingredient.currentStock
                                                        }
                                                    </span>

                                                    {isLow && (
                                                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                                                            Low stock
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-ink-600">
                                                {ingredient.minimumStock}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-ink-800">
                                                {ingredient.latestPurchaseUnitCost == null
                                                    ? "No purchases yet"
                                                    : `₱${Number(ingredient.latestPurchaseUnitCost).toFixed(2)} / ${ingredient.unit?.name ?? "unit"}`}
                                            </td>

                                            <td className="px-6 py-4">
                                                <ExpirationStatus ingredient={ingredient} />
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            ingredient
                                                        )
                                                    }
                                                    className="font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
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
            </div>

            {units.length === 0 && !loading && (
                <p className="mt-3 text-sm text-ink-500">
                    No units are set up yet. Units come from the database seed
                    (Kilogram, Liter, Piece).
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
              }
            : {
                  name: "",
                  unitId: undefined,
                  minimumStock: 0,
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Alert type="error" message={submitError} />

                <Input
                    label="Name"
                    placeholder="e.g. Chicken"
                    error={errors.name?.message}
                    {...register("name")}
                />

                <div>
                    <label
                        htmlFor="unit"
                        className="mb-1.5 block text-sm font-medium text-ink-800"
                    >
                        Unit
                    </label>

                    <select
                        id="unit"
                        {...register("unitId")}
                        className={[
                            "w-full rounded-lg border border-stone-200 bg-white",
                            "px-3 py-2 text-sm text-ink-900",
                            "transition-colors focus:border-orange-500",
                            "focus:outline-none focus:ring-2 focus:ring-orange-500/20",
                        ].join(" ")}
                    >
                        <option value="">Select unit...</option>

                        {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
                            </option>
                        ))}
                    </select>

                    {errors.unitId && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.unitId.message}
                        </p>
                    )}
                </div>

                <div>
                    <Input
                        label="Minimum Stock"
                        type="number"
                        step="0.01"
                        error={errors.minimumStock?.message}
                        {...register("minimumStock")}
                    />
                </div>

                <p className="rounded-lg bg-stone-50 px-3 py-2.5 text-xs leading-relaxed text-ink-500">
                    Cost per unit is automatically based on the most recent purchase for this ingredient.
                </p>

                {isEditing && (
                    <div className="rounded-lg bg-stone-50 px-3 py-2.5">
                        <p className="text-xs leading-relaxed text-ink-500">
                            Current stock ({ingredient?.currentStock}) can only
                            be changed by recording a Purchase or preparing
                            the Daily Menu — not edited directly here.
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function ExpirationStatus({ ingredient }: { ingredient: Ingredient }) {
    if (!ingredient.expirationStatus || !ingredient.expirationDate) {
        return <span className="text-sm text-ink-500">No active batch</span>;
    }

    const styles = {
        EXPIRED: "bg-red-50 text-red-700",
        EXPIRING_SOON: "bg-orange-50 text-orange-700",
        SAFE: "bg-green-50 text-green-700",
    };

    const labels = {
        EXPIRED: "Expired",
        EXPIRING_SOON: "Expiring soon",
        SAFE: "Safe",
    };

    return (
        <div className="space-y-1">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[ingredient.expirationStatus]}`}>
                {labels[ingredient.expirationStatus]}
            </span>
            <p className="text-xs text-ink-500">
                {new Date(ingredient.expirationDate).toLocaleDateString()}
            </p>
        </div>
    );
}

function ExpirationAlerts({ alerts }: { alerts: ExpirationAlert[] }) {
    const expired = alerts.filter((alert) => alert.status === "EXPIRED");
    const expiringSoon = alerts.filter((alert) => alert.status === "EXPIRING_SOON");

    return (
        <section className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div>
                <h2 className="font-semibold text-ink-900">Expiration Alerts</h2>
                <p className="mt-1 text-sm text-ink-500">Active inventory batches that need attention.</p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <ExpirationAlertList title="Expired" alerts={expired} tone="red" />
                <ExpirationAlertList title="Expiring Soon" alerts={expiringSoon} tone="orange" />
            </div>
        </section>
    );
}

function ExpirationAlertList({ title, alerts, tone }: { title: string; alerts: ExpirationAlert[]; tone: "red" | "orange" }) {
    const headingClass = tone === "red" ? "text-red-700" : "text-orange-700";

    return (
        <div className="rounded-xl bg-stone-50 p-4">
            <h3 className={`text-sm font-semibold ${headingClass}`}>{title}</h3>
            {alerts.length === 0 ? (
                <p className="mt-2 text-sm text-ink-500">None.</p>
            ) : (
                <ul className="mt-3 space-y-2 text-sm">
                    {alerts.map((alert) => (
                        <li key={alert.id} className="rounded-lg bg-white px-3 py-2 text-ink-700">
                            <span className="font-medium text-ink-900">{alert.ingredientName}</span> — {alert.remainingQuantity} {alert.unit} — {tone === "red"
                                ? `Expired ${new Date(alert.expirationDate).toLocaleDateString()}`
                                : `Expires ${new Date(alert.expirationDate).toLocaleDateString()}${alert.daysRemaining === 0 ? " (today)" : ` (${alert.daysRemaining} day${alert.daysRemaining === 1 ? "" : "s"} left)`}`}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
