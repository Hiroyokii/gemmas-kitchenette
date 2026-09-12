import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createSpoilageSchema } from "../schemas/spoilage.schema.js";
import { createSpoilage, getAvailableBatches, getSpoilageRecords } from "../controllers/spoilage.controller.js";

const router = Router();
router.use(authenticate, authorize("ADMIN", "STAFF"));
router.get("/", getSpoilageRecords);
router.get("/batches", getAvailableBatches);
router.post("/", validate(createSpoilageSchema), createSpoilage);
export default router;
