import { CreateIngredientInput } from "../schemas/ingredient.schema.js";
import { 
    findIngredientByName, 
    findUnitById, 
    getIngredients, 
    createIngredient, 
    findIngredientById,
    updateIngredient
} from "../repositories/ingredient.repository.js";

import { ConflictError } from "../errors/ConflictError.js";
import { NotFoundError } from "../errors/NotFoundError.js";


export async function getIngredientsService() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warningEnd = new Date(today);
    warningEnd.setDate(warningEnd.getDate() + 3);
    const ingredients = await getIngredients();

    return ingredients.map(({ purchaseItems, ...ingredient }) => {
        const nextExpiringBatch = purchaseItems
            .filter((item) =>
                Number(item.remainingQuantity) > 0 && item.expirationDate
            )
            .sort((left, right) =>
                left.expirationDate!.getTime() - right.expirationDate!.getTime()
            )[0];

        let expirationStatus: "SAFE" | "EXPIRING_SOON" | "EXPIRED" | null = null;

        if (nextExpiringBatch?.expirationDate) {
            const expirationDate = new Date(nextExpiringBatch.expirationDate);
            expirationDate.setHours(0, 0, 0, 0);

            expirationStatus = expirationDate < today
                ? "EXPIRED"
                : expirationDate <= warningEnd
                    ? "EXPIRING_SOON"
                    : "SAFE";
        }

        return {
            ...ingredient,
            latestPurchaseUnitCost: purchaseItems[0]
                ? Number(purchaseItems[0].unitCost)
                : null,
            expirationDate: nextExpiringBatch?.expirationDate ?? null,
            expirationStatus,
        };
    });
}

export async function createIngredientService(
    data: CreateIngredientInput
) {

    const existingIngredient = 
        await findIngredientByName(
            data.name
        );

    if (existingIngredient) {
        throw new ConflictError(
            "Ingredient already exists."
        );
    }

    const unit = 
        await findUnitById(
            data.unitId
        );
    
    if (!unit) {
        throw new NotFoundError(
            "Unit not found."
        );
    }

    return createIngredient(data);
}

export async function updateIngredientService(
    ingredientId: number,
    data: CreateIngredientInput
) {
    const ingredient =
        await findIngredientById(
            ingredientId
        );

    if (!ingredient) {
        throw new NotFoundError(
            "Ingredient not found."
        );
    }

    const unit =
        await findUnitById(
            data.unitId
        );
    
    if (!unit) {
        throw new NotFoundError(
            "Unit not found."
        );
    }

    const existingIngredient = 
        await findIngredientByName(
            data.name
        );

    if (
        existingIngredient &&
        existingIngredient.id !== ingredientId
    ) {
        throw new ConflictError(
            "Ingredient already exists."
        );
    }

    return updateIngredient(
        ingredientId,
        data
    );
}
