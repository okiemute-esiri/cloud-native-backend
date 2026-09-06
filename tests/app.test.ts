import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";

const config: AppConfig = {
  NODE_ENV: "test",
  PORT: 3000,
  SERVICE_NAME: "cloud-native-backend",
  SERVICE_VERSION: "1.0.0-test",
  LOG_LEVEL: "error"
};

describe("cloud native backend", () => {
  const app = createApp(config);

  it("exposes health and readiness endpoints", async () => {
    await request(app).get("/health").expect(200, { status: "ok" });
    await request(app).get("/ready").expect(200, { status: "ready" });
  });

  it("returns service metadata from externalized config", async () => {
    const response = await request(app).get("/api/v1/info").expect(200);
    expect(response.body.data).toEqual({
      service: "cloud-native-backend",
      version: "1.0.0-test",
      environment: "test"
    });
  });

  it("propagates an incoming correlation id", async () => {
    const response = await request(app)
      .get("/health")
      .set("x-request-id", "request-123")
      .expect(200);

    expect(response.headers["x-request-id"]).toBe("request-123");
  });

  it("generates a correlation id when one is absent", async () => {
    const response = await request(app).get("/health").expect(200);
    expect(response.headers["x-request-id"]).toBeTruthy();
  });
});
