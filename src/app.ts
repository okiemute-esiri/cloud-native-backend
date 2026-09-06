import { randomUUID } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import type { AppConfig } from "./config.js";

export function createApp(config: AppConfig) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));

  app.use((req, res, next) => {
    const requestId = req.header("x-request-id")?.trim() || randomUUID();
    res.setHeader("x-request-id", requestId);
    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/ready", (_req, res) => {
    res.status(200).json({ status: "ready" });
  });

  app.get("/api/v1/info", (_req, res) => {
    res.json({
      data: {
        service: config.SERVICE_NAME,
        version: config.SERVICE_VERSION,
        environment: config.NODE_ENV
      }
    });
  });

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: "ROUTE_NOT_FOUND", message: "Route not found" }
    });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    return res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Unexpected server error" }
    });
  });

  return app;
}
