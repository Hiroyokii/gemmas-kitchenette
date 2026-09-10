import "dotenv/config";
import app from "./app.js";

const PORT = Number.parseInt(process.env.PORT ?? "5000", 10);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be a valid TCP port number.");
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
