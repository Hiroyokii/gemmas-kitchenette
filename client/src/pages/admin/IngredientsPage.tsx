import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ingredientSchema, type IngredientForm, type IngredientFormInput } from "../../schemas/ingredient.schema";
import { createIngredient, getIngredients, getUnits, updateIngredient } from "../../services/ingredient.service";
import type { Ingredient, Unit } from "../../types/Ingredient";
import { getErrorMessage } from "../../utils/getErrorMessage";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";

export default function IngredientsPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Ingredient | null>(null);
    const ingredientsQuery = useQuery({ queryKey: ["ingredients"], queryFn: getIngredients });
    const unitsQuery = useQuery({ queryKey: ["units"], queryFn: getUnits });
    const ingredients = ingredientsQuery.data ?? [];

    return <div className="px-6 pt-6 pb-8 lg:px-8 lg:pt-8">
        <div className="mb-7 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight text-ink-900">Ingredients</h1><p className="mt-1 text-sm text-ink-500">Manage ingredients, stock levels, and costs.</p></div><Button onClick={() => { setEditing(null); setModalOpen(true); }}>+ Add Ingredient</Button></div>
        <Alert type="error" message={ingredientsQuery.error ? getErrorMessage(ingredientsQuery.error, "Failed to load ingredients.") : ""} />
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="border-b border-stone-200 bg-stone-50"><tr className="text-left"><th className="px-6 py-4 font-semibold text-ink-800">Ingredient</th><th className="px-6 py-4 font-semibold text-ink-800">Unit</th><th className="px-6 py-4 font-semibold text-ink-800">Current Stock</th><th className="px-6 py-4 font-semibold text-ink-800">Minimum Stock</th><th className="px-6 py-4 font-semibold text-ink-800">Cost / Unit</th><th className="px-6 py-4 text-right font-semibold text-ink-800">Action</th></tr></thead><tbody>
            {ingredientsQuery.isPending && <tr><td colSpan={6} className="px-6 py-10 text-center text-ink-500">Loading ingredients...</td></tr>}
            {!ingredientsQuery.isPending && ingredients.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-ink-500">No ingredients yet.</td></tr>}
            {ingredients.map((ingredient) => { const low = Number(ingredient.currentStock) < Number(ingredient.minimumStock); return <tr key={ingredient.id} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/70"><td className="px-6 py-4 font-medium text-ink-900">{ingredient.name}</td><td className="px-6 py-4 text-ink-600">{ingredient.unit?.name ?? "—"}</td><td className="px-6 py-4"><span className={low ? "font-semibold text-red-600" : "text-ink-800"}>{ingredient.currentStock}</span>{low && <span className="ml-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">Low stock</span>}</td><td className="px-6 py-4 text-ink-600">{ingredient.minimumStock}</td><td className="px-6 py-4 font-medium text-ink-800">{ingredient.latestPurchaseUnitCost == null ? "No purchases yet" : `₱${Number(ingredient.latestPurchaseUnitCost).toFixed(2)} / ${ingredient.unit?.name ?? "unit"}`}</td><td className="px-6 py-4 text-right"><button type="button" onClick={() => { setEditing(ingredient); setModalOpen(true); }} className="font-medium text-orange-600 hover:text-orange-700 hover:underline">Edit</button></td></tr>; })}
        </tbody></table></div></div>
        {modalOpen && <IngredientModal ingredient={editing} units={unitsQuery.data ?? []} onClose={() => setModalOpen(false)} onSaved={() => setModalOpen(false)} />}
    </div>;
}

function IngredientModal({ ingredient, units, onClose, onSaved }: { ingredient: Ingredient | null; units: Unit[]; onClose: () => void; onSaved: () => void }) {
    const queryClient = useQueryClient(); const editing = Boolean(ingredient); const [submitError, setSubmitError] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm<IngredientFormInput, unknown, IngredientForm>({ resolver: zodResolver(ingredientSchema), defaultValues: ingredient ? { name: ingredient.name, unitId: ingredient.unitId, minimumStock: ingredient.minimumStock } : { name: "", unitId: undefined, minimumStock: 0 } });
    const mutation = useMutation({ mutationFn: (data: IngredientForm) => editing && ingredient ? updateIngredient(ingredient.id, data) : createIngredient(data), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["ingredients"] }); onSaved(); }, onError: (error) => setSubmitError(getErrorMessage(error, "Failed to save ingredient.")) });
    return <Modal title={editing ? "Edit Ingredient" : "Add Ingredient"} onClose={onClose}><form onSubmit={handleSubmit((data) => { setSubmitError(""); mutation.mutate(data); })} className="space-y-5"><Alert type="error" message={submitError} /><Input label="Name" error={errors.name?.message} {...register("name")} /><div><label className="mb-1.5 block text-sm font-medium text-ink-800">Unit</label><select {...register("unitId")} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-ink-900"><option value="">Select unit...</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>{errors.unitId && <p className="mt-1 text-xs text-red-600">{errors.unitId.message}</p>}</div><Input label="Minimum Stock" type="number" step="0.01" error={errors.minimumStock?.message} {...register("minimumStock")} /><p className="rounded-lg bg-stone-50 px-3 py-2.5 text-xs text-ink-500">Cost per unit is based on the most recent purchase. Stock changes through purchases, batch use, and spoilage records.</p><div className="flex justify-end gap-2 border-t border-stone-100 pt-4"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" isLoading={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save"}</Button></div></form></Modal>;
}
