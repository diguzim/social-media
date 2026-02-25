# Social Media Monorepo

Microservices monorepo powered by Turborepo and pnpm. It includes an API gateway, an auth service, and a shared contracts package that defines message commands and DTOs.

## Stack

- Node.js (>=18)
- pnpm workspaces
- Turborepo
- NestJS microservices (TCP transport)
- Docker Compose (infra only in dev)

## Apps

- `api-gateway`: HTTP entrypoint for clients
- `auth-service`: Auth microservice listening on TCP
- `posts-service`: Posts microservice listening on TCP

## Packages

- `@repo/contracts`: Shared message contracts and commands
- `@repo/eslint-config`: Shared ESLint configuration
- `@repo/log-context`: Correlation id, user id, and request duration context
- `@repo/typescript-config`: Shared TypeScript base config

## Infrastructure (Dev)

We run infrastructure in Docker and keep services local for hot reload.

- PostgreSQL: `localhost:5432`
- Loki: `localhost:3100`
- Grafana: `localhost:3001` (admin/admin)

Start infra only:

```sh
docker compose -f docker-compose.infra.yml up -d
```

## Contracts

The API gateway and microservices share message contracts through `@repo/contracts`.

Example usage:

```ts
import { AUTH_COMMANDS } from "@repo/contracts";
import type { RegisterRequest, RegisterReply } from "@repo/contracts";

this.authClient.send<RegisterReply>({ cmd: AUTH_COMMANDS.register }, payload);
```

## Getting Started

Install dependencies:

```sh
pnpm install
```

Create environment files (per service):

```sh
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/posts-service/.env.example apps/posts-service/.env
```

Build all packages/apps:

```sh
pnpm build
```

Run all services in dev mode:

```sh
pnpm dev
```

Hybrid workflow (recommended for dev):

```sh
docker compose -f docker-compose.infra.yml up -d
pnpm dev
```

Run a single app:

```sh
pnpm --filter api-gateway dev
pnpm --filter auth-service dev
pnpm --filter posts-service dev
```

## Useful Scripts

- `pnpm dev`: Run all apps in watch mode (Turbo)
- `pnpm build`: Build all apps and packages
- `pnpm lint`: Lint all apps and packages
- `pnpm check-types`: Type-check all packages

## Docker (Production Builds)

Each service has a production Dockerfile that builds to `dist/` and runs the
compiled output (no hot reload). These are intended for production or staging.

- [apps/api-gateway/Dockerfile](apps/api-gateway/Dockerfile)
- [apps/auth-service/Dockerfile](apps/auth-service/Dockerfile)
- [apps/posts-service/Dockerfile](apps/posts-service/Dockerfile)

## Environment Variables

- Per-service examples live in `apps/*/.env.example`
- A root reference file is available at [.env.example](.env.example)

## TODO

- [ ] Production docker-compose
- [ ] Errors (Sentry)
- [ ] Observability platform (Datadog)
- [ ] Tracing (OpenTelemetry)
- [ ] Kubernetes deployment
- [ ] API documentation (Swagger)
- [ ] Testing (Jest)
- [ ] Code coverage
- [ ] Caching (Redis)
- [ ] Rate limiting (Redis)
- [ ] Database integration (PostgreSQL)
- [ ] Message broker integration (RabbitMQ, Kafka)

## Notes

- The contracts package is compiled to `dist/` and exported from there.
