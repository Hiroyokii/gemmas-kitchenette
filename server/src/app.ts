import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import foodRoutes from "./routes/food.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import recipeRoutes from "./routes/recipe.routes.js"

const app = express();

app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/foods", foodRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/recipes", recipeRoutes);

export default app;