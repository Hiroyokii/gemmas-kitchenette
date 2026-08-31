import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createReviewSchema } from "../schemas/review.schema.js";
import { createReview } from "../repositories/review.repository.js";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("CUSTOMER"),
    validate(createReviewSchema),
    createReview
);

export default router;