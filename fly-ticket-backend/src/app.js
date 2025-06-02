import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Load backend API routes:
import cityRoutes from "./routes/cityRoutes.js";
import flightRoutes from "./routes/flightRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/cities", cityRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);

// Serve static files from the front-end public directory:
// Common mistake: using path.join(__dirname, '../fly-ticket-frontend/public')
// Instead, navigate two levels up to 'fly-ticket-frontend/public'.
const frontendStaticPath = path.join(
  __dirname,
  "../../fly-ticket-frontend/public"
);
app.use(express.static(frontendStaticPath));

// Wildcard: return index.html for all GET requests
// This catches requests not handled by the static middleware (e.g., flight-detail.html).
// NOTE: It will not catch 'api/...' routes because they are processed above.
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendStaticPath, "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
