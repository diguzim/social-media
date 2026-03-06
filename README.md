# Social Media Monorepo

Microservices monorepo powered by Turborepo and pnpm. It includes an API gateway, auth and posts services, an event handler service, and shared packages.

## Stack

- Node.js (>=18)
- pnpm workspaces
- Turborepo
- NestJS microservices (TCP transport)
- Node.js EventEmitter for event-driven architecture
- Docker Compose (infra only in dev)

## Apps

- `api-gateway`: HTTP entrypoint for clients (port 4000)
- `auth-service`: Auth microservice listening on TCP (port 4001)
- `posts-service`: Posts microservice listening on TCP (port 4002)
- `event-handler-service`: Background worker that processes domain events (port 4003)
- `user-portal`: React + Vite frontend for user management (port 3000)

## Packages

- `@repo/contracts`: Shared RPC message contracts and commands
- `@repo/events`: Shared event types and event names
- `@repo/eslint-config`: Shared ESLint configuration
- `@repo/exception-filters`: Shared NestJS exception filters
- `@repo/log-context`: Correlation id, user id, and request duration context
- `@repo/typescript-config`: Shared TypeScript base config

## Infrastructure (Dev)

We run infrastructure in Docker and keep services local for hot reload.

- PostgreSQL: `localhost:5432` (for future use)
- Loki: `localhost:3100` (log aggregation)
- Grafana: `localhost:3001` (visualization, admin/admin)
- RabbitMQ: `localhost:5672` (message broker)

Start infra:

```sh
docker compose -f docker-compose.infra.yml up -d
```

RabbitMQ Management UI: [http://localhost:15672](http://localhost:15672) (guest/guest)

## Event-Driven Architecture

Services emit domain events that are processed by handlers:

1. **Event Emitters**: Services create events when domain events occur (e.g., `user.registered`)
2. **Event Handlers**: Background workers listen to events and perform side effects
3. **Decoupling**: Services don't know about or depend on event handlers

### Example: User Registration Flow

```
User Registration Request
↓
AuthController → RegisterUseCase
↓
UserRepository.create()
↓
RegisterUseCase emits USER_EVENTS.REGISTERED
↓
EventEmitter broadcasts to all listeners
↓
UserRegistrationHandler processes the event
(sends welcome email, creates user profile, etc.)
```

## RPC Contracts

The API gateway and microservices communicate via TCP using NestJS microservices pattern.

Example usage:

```ts
import { AUTH_COMMANDS } from "@repo/contracts";
import type { RegisterRequest, RegisterReply } from "@repo/contracts";

this.authClient.send<RegisterReply>({ cmd: AUTH_COMMANDS.register }, payload);
```

## Exception Handling

Microservices serialize NestJS exceptions over TCP and the API gateway maps them back to HTTP responses (e.g., duplicate email returns 409 Conflict).

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

Recommended hybrid workflow (infrastructure in Docker, services local):

```sh
docker compose -f docker-compose.infra.yml up -d
pnpm dev
```

Run a single app:

```sh
pnpm --filter api-gateway dev
pnpm --filter auth-service dev
pnpm --filter posts-service dev
pnpm --filter event-handler-service dev
pnpm --filter user-portal dev
```

## Useful Scripts

- `pnpm dev`: Run all services in watch mode (Turbo)
- `pnpm build`: Build all services and packages
- `pnpm test`: Run all tests
- `pnpm lint`: Lint all code
- `pnpm check-types`: Type-check all packages

## Docker (Production Builds)

Each service has a production Dockerfile for deployment:

- [apps/api-gateway/Dockerfile](apps/api-gateway/Dockerfile)
- [apps/auth-service/Dockerfile](apps/auth-service/Dockerfile)
- [apps/posts-service/Dockerfile](apps/posts-service/Dockerfile)
- [apps/event-handler-service/Dockerfile](apps/event-handler-service/Dockerfile)

## Environment Variables

- Per-service examples in `apps/*/.env.example`
- Root reference at [.env.example](.env.example)

## TODO

- [ ] Production docker-compose (all services)
- [ ] RabbitMQ message broker integration
- [ ] Error tracking (Sentry)
- [ ] Observability platform (Datadog)
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Kubernetes deployment
- [ ] API documentation (Swagger)
- [ ] Code coverage reports
- [ ] Caching (Redis)
- [ ] Rate limiting
- [ ] PostgreSQL integration
- [ ] Email service integration
- [ ] Search service (Elasticsearch)

## Notes

- All packages are compiled to `dist/` and exported via their main field
