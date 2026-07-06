import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Temporary Route
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Gemma's Kitchenette API is running 🚀",
  });
});

export default app;