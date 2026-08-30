import { createReviewService } from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async(req, res) => {
    const review = await createReviewService(
        req.user!.userId,
        req.body
    );

    res.status(201).json(review);
})