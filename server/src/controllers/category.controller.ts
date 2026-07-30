import { findAllCategories } from "../repositories/category.repository.js";

import { asyncHandler } from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (_, res) => {
    const categories =
        await findAllCategories();

    res.status(200).json(categories);
})