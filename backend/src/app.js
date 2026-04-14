import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { authRouter } from "./routes/auth.js";
import { packagesRouter } from "./routes/packages.js";
import { menusRouter } from "./routes/menus.js";
import { bookingsRouter } from "./routes/bookings.js";
import { contactsRouter } from "./routes/contacts.js";
import { customMenuRequestsRouter } from "./routes/customMenuRequests.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  // ── API routes ──────────────────────────────────────────────────────────
  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/packages", packagesRouter);
  app.use("/api/menus", menusRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/contacts", contactsRouter);
  app.use("/api/custom-menu-requests", customMenuRequestsRouter);

  // ── Serve frontend static files ──────────────────────────────────────────
  const frontendDir = path.resolve(__dirname, "../../frontend");
  app.use(express.static(frontendDir));

  // Fallback: serve index.html for any non-API route (SPA-friendly)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
  });

  // ── Global error handler ─────────────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  });

  return app;
}
