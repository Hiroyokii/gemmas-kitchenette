import { CreateIngredientInput } from "../schemas/ingredient.schema.js";
import { 
    findIngredientByName, 
    findUnitById, 
    getIngredients, 
    createIngredient, 
    findIngredientById,
    updateIngredient
} from "../repositories/ingredient.repository.js";
import { AppError } from "../errors/AppError.js";


export async function getIngredientsService() {
    return getIngredients
}

export async function createIngredientService(
    data: CreateIngredientInput
) {

    const existingIngredient = 
        await findIngredientByName(
            data.name
        );

    if (existingIngredient) {
        
        throw new Error(
            "Ingredient already exists."
        );
    }

    const unit = 
        await findUnitById(
            data.unitId
        );
    
    if (!unit) {
        
        throw new Error(
            "Unit not found."
        );
    }

    return createIngredient(data)
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
        throw new AppError(
            404,
            "Ingredient not found."
        );
    }

    const unit =
        await findUnitById(
            data.unitId
        );
    
    if (!unit) {
        throw new AppError(
            404,
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
        throw new AppError(
            409,
            "Ingredient already exists."
        );
    }

    return updateIngredient(
        ingredientId,
        data
    );
}
