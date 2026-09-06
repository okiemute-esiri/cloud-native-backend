# Cloud Native Backend

A production-oriented Node.js/TypeScript backend demonstrating cloud-native application design: externalized configuration, operational health endpoints, graceful shutdown, request correlation, container hardening, automated testing and CI validation.

## Status

This repository contains a working cloud-native backend foundation. It is intentionally infrastructure-neutral: the application can run locally or inside a container and is prepared for deployment behind an orchestrator, but this repository does not claim a live cloud deployment.

## Implemented

- Node.js 22 + TypeScript
- Express HTTP service
- strict TypeScript compiler settings
- validated environment configuration with Zod
- `/health` liveness endpoint
- `/ready` readiness endpoint
- `/api/v1/info` service metadata endpoint
- inbound `x-request-id` propagation
- generated request correlation IDs when absent
- graceful SIGTERM/SIGINT shutdown with timeout protection
- structured 404 and 500 response contracts
- Vitest + Supertest coverage
- multi-stage Docker image
- non-root runtime container
- `.dockerignore` and `.gitignore`
- `.env.example`
- GitHub Actions typecheck/test/build/container validation

## Architecture

```text
Client / Load Balancer / Ingress
          |
          v
      Express API
          |
          +-- Request correlation
          +-- Health/readiness
          +-- Service metadata
          +-- Error mapping
          |
          v
 Externalized runtime configuration
```

## API

```text
GET /health
GET /ready
GET /api/v1/info
```

Example metadata response:

```json
{
  "data": {
    "service": "cloud-native-backend",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

## Configuration

Configuration is supplied through environment variables and validated at startup.

```text
NODE_ENV=development
PORT=3000
SERVICE_NAME=cloud-native-backend
SERVICE_VERSION=1.0.0
LOG_LEVEL=info
```

See `.env.example` for the documented defaults.

## Local Development

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm test
npm run build
```

Production build:

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t cloud-native-backend .
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e SERVICE_VERSION=1.0.0 \
  cloud-native-backend
```

The runtime stage executes as the non-root `node` user.

## Reliability Behaviour

The service exposes separate liveness and readiness endpoints so an orchestrator can distinguish process health from readiness to receive traffic. On SIGTERM or SIGINT, the HTTP listener stops accepting new work and is given up to ten seconds to close cleanly before forced termination.

Request correlation is supported through `x-request-id`: existing IDs are preserved and new IDs are generated when callers do not provide one.

## CI Pipeline

GitHub Actions validates every push to `main` and every pull request:

```text
Checkout
  |
Setup Node.js 22
  |
npm install
  |
Typecheck
  |
Tests
  |
Build
  |
Docker image build
```

## Repository Structure

```text
.
├── src/
│   ├── app.ts
│   ├── config.ts
│   └── server.ts
├── tests/
│   └── app.test.ts
├── .github/workflows/
│   └── ci.yml
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Production Evolution

Planned extensions include structured JSON logging, OpenTelemetry metrics and tracing, dependency-aware readiness checks, managed PostgreSQL/Redis adapters, secrets-manager integration, rate limiting, authentication/authorization, Kubernetes deployment manifests, autoscaling configuration, service-level indicators and deployment automation.

## Portfolio Focus

This project demonstrates twelve-factor and cloud-native backend concerns at the application boundary rather than claiming cloud services that are not implemented. It focuses on configuration, health, lifecycle management, observability primitives, immutable packaging and CI-verifiable deployment artifacts.
