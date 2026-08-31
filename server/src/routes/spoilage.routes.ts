import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createSpoilageSchema } from "../schemas/spoilage.schema.js";
import { createSpoilage, getSpoilageRecords } from "../controllers/spoilage.controller.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    getSpoilageRecords
);

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "STAFF"),
    validate(createSpoilageSchema),
    createSpoilage
);

export default router;