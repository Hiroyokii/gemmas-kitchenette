import { CreateIngredientInput } from "../schemas/ingredient.schema.js";
import { 
    findIngredientByName, 
    findUnitById, 
    getIngredients, 
    createIngredient 
} from "../repositories/ingredient.repository.js";


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
