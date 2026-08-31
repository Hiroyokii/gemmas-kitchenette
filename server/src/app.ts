import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import foodRoutes from "./routes/food.routes.js";
import ingredientRoutes from "./routes/ingredient.routes.js"
import purchaseRoutes from "./routes/purchase.routes.js";
import recipeRoutes from "./routes/recipe.routes.js"
import dailyMenuRoutes from "./routes/dailyMenu.routes.js"
import orderRoutes from "./routes/order.routes.js";
import reportRoutes from "./routes/report.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import spoilageRoutes from "./routes/spoilage.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use("/auth", authRoutes);
app.use("/foods", foodRoutes);
app.use("/ingredients", ingredientRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/recipes", recipeRoutes);
app.use("/daily-menu", dailyMenuRoutes);
app.use("/orders", orderRoutes);
app.use("/reports", reportRoutes);
app.use("/categories", categoryRoutes);
app.use("/reviews", reviewRoutes);
app.use("/spoilage", spoilageRoutes);

app.use(errorHandler);

export default app;