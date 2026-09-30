import { randomUUID } from "node:crypto";
import { AppError } from "../errors/AppError.js";

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

export async function uploadFoodImageService(
    image: Buffer,
    contentType: string
): Promise<string> {
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_FOOD_BUCKET || "food-images";
    const extension = EXTENSIONS[contentType];

    if (!supabaseUrl || !secretKey || !extension) {
        throw new AppError(503, "Image storage is not configured.");
    }

    const objectPath = `${randomUUID()}.${extension}`;
    const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`,
        {
            method: "POST",
            headers: {
                apikey: secretKey,
                "Content-Type": contentType,
                "Cache-Control": "max-age=31536000",
            },
            body: new Uint8Array(image),
            signal: AbortSignal.timeout(30_000),
        }
    );

    if (!response.ok) {
        console.error(`Supabase image upload failed with status ${response.status}.`);
        throw new AppError(502, "Could not upload image. Please try again.");
    }

    return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}
