import { createFoodService, getFoodsService, updateFoodService } from "../services/food.service.js";
import { uploadFoodImageService } from "../services/foodImage.service.js";
import { createFoodSchema } from "../schemas/food.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const FOOD_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function imageContentMatches(image: Buffer, contentType: string): boolean {
    if (contentType === "image/png") {
        return image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    }
    if (contentType === "image/jpeg") {
        return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
    }
    return contentType === "image/webp"
        && image.toString("ascii", 0, 4) === "RIFF"
        && image.toString("ascii", 8, 12) === "WEBP";
}

export const uploadFoodImage = asyncHandler(async (req, res) => {
    const contentType = req.headers["content-type"]?.split(";")[0]?.trim();
    if (!contentType || !FOOD_IMAGE_TYPES.has(contentType) || !Buffer.isBuffer(req.body)) {
        return res.status(400).json({ message: "Choose a JPG, PNG, or WebP image." });
    }

    if (req.body.length === 0 || req.body.length > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "Image must be smaller than 5 MB." });
    }
    if (!imageContentMatches(req.body, contentType)) {
        return res.status(400).json({ message: "Image contents do not match the selected file type." });
    }

    const imageUrl = await uploadFoodImageService(req.body, contentType);
    res.status(201).json({ imageUrl });
});

export const createFood = asyncHandler(async (req, res) => {
    const data = createFoodSchema.parse(req.body);
    const food = await createFoodService(data);

    res.status(201).json(food);
});

export const getFoods = asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;

    const categoryId = req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined;

    const foods = await getFoodsService(
        search,
        categoryId
    );

    res.status(200).json(foods);
});

export const updateFood =
    asyncHandler(async (req, res) => {

        const food =
            await updateFoodService(
                Number(req.params.id),
                req.body
            );

        res.status(200).json(food);
    });
