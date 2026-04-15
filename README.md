# Social Media Monorepo

Microservices monorepo powered by Turborepo and pnpm. It includes an API gateway, auth/posts/image/friendship/email services, an event handler service, and shared packages.

## Stack

- Node.js (>=18)
- pnpm workspaces
- Turborepo
- NestJS microservices (TCP transport)
- Node.js EventEmitter for event-driven architecture
- API gateway IP rate limiting (`@nestjs/throttler`)
- Docker Compose (infra only in dev)

## Apps

- `api-gateway`: HTTP entrypoint for clients (port 4000)
- `auth-service`: Auth microservice listening on TCP (port 4001)
- `posts-service`: Posts microservice listening on TCP (port 4002)
- `image-service`: Image microservice listening on TCP (port 4004) for profile picture upload/storage
  - Avatar retrieval is transport-safe (byte payload), avoiding cross-service filesystem path coupling
- `friendship-service`: Friendship microservice listening on TCP (port 4005) for friend requests and relationship status
- `email-service`: Email delivery microservice listening on TCP (port 4006) and RabbitMQ for synchronous and asynchronous sending
- `event-handler-service`: Background worker that processes domain events (port 4003)
- `user-portal`: React + Vite frontend for user management (port 3000)
- `ui-showcase`: Storybook app for shared component demos (port 6006)

## Packages

- `@repo/contracts`: Shared boundary contracts (`API` for frontend↔gateway and `RPC` for gateway↔microservices) and command constants
- `@repo/events`: Shared event types and event names
- `@repo/eslint-config`: Shared ESLint configuration
- `@repo/exception-filters`: Shared NestJS exception filters
- `@repo/log-context`: Correlation id, user id, and request duration context
- `@repo/typescript-config`: Shared TypeScript base config
- `@repo/ui`: Shared runtime UI primitives/components for frontend apps

## Infrastructure (Dev)

We run infrastructure in Docker and keep services local for hot reload.

- PostgreSQL: `localhost:5432` (for future use)
- Loki: `localhost:3100` (log aggregation)
- Grafana: `localhost:3002` (visualization, admin/admin)
- RabbitMQ: `localhost:5672` (message broker)

Start infra:

```sh
docker compose -f docker-compose.infra.yml up -d
```

RabbitMQ Management UI: [http://localhost:15672](http://localhost:15672) (guest/guest)

## Frontend Authentication Flow

1. **Register** (`/register`) - User creates account with name, username, email, and password
   - POST `/users` → auth-service validates and creates user
   - RabbitMQ publishes `user.registered` event
   - UserRegistrationHandler processes the event (logs for now)
   - User redirected to login page

2. **Login** (`/login`) - User authenticates with email (or username) and password
   - POST `/users/login` → auth-service validates credentials
   - JWT token generated and stored in localStorage (`jwtToken`)
   - User profile fetched via GET `/users/me` and cached as `user`
   - User redirected to home page

3. **Protected Pages** (`/`, `/users/:username`, `/users/:username/:section`, `/users/:username/photos/*`, `/account/*`, `/friends`) - Authenticated user area
   - Route guard requires both `jwtToken` and `user` in localStorage
   - Home (`/`) shows "Welcome {name}!" and user summary
   - User profile (`/users/:username`) is the single profile route for both self and other users
   - Ownership differentiation is a core behavior switch on user profile routes: route `:username` is compared against the authenticated user profile to drive self vs public behavior
   - Profile sections are URL-driven tabs: Timeline, Photos, About, Friends, Personal Data
   - Photos section is a nested route area with Unsorted and Albums tabs (`/users/:username/photos/unsorted`, `/users/:username/photos/albums`, `/users/:username/photos/albums/:albumId`)
   - Account management lives in a dedicated settings-like area with left-side vertical navigation and URL-driven subroutes (`/account/personal-data`, `/account/privacy`, `/account/security`, `/account/notifications`, `/account/configurations`, `/account/help-support`)
   - Photos tab is backend-driven with nested unsorted/albums navigation and photo modal viewing; profile owners can create/edit/delete albums, upload photos contextually inside unsorted or album detail, and delete photos via per-photo actions while public profiles remain read-only
   - Friends (`/friends`) shows accepted friends plus incoming/outgoing pending requests
   - Profile supports avatar upload (`POST /users/avatar`) and serves avatar by URL (`GET /users/:userId/avatar`)
   - Logout clears auth data and redirects to `/login`

## Event-Driven Architecture

Services emit domain events that are processed by handlers via RabbitMQ:

1. **Event Emitters**: Services create events when domain events occur (e.g., `user.registered`)
2. **Event Handlers**: Background workers (email-service and other handlers) listen on RabbitMQ and perform side effects
3. **Message Broker**: RabbitMQ manages event distribution with topic exchanges
4. **Decoupling**: Services don't know about or depend on event handlers

### Example: User Registration Flow

```
User Registration Request
↓
API Gateway → Auth Service (TCP)
↓
RegisterUseCase → UserRepository.create()
↓
RegisterUseCase emits USER_EVENTS.REGISTERED to RabbitMQ
↓
RabbitMQ publishes to "social-media.events" exchange
(routing key: user.registered)
↓
email-service consumes from queue
↓
EmailService composes and sends verification email
```

## API and RPC Contracts

Contracts are separated by boundary in `@repo/contracts`:

- `API.*` → frontend ↔ API gateway (HTTP contract)
- `RPC.*` → API gateway ↔ microservices (TCP contract)

The API gateway translates between these two boundaries.

Example usage:

```ts
import { AUTH_COMMANDS } from "@repo/contracts";
import type { API, RPC } from "@repo/contracts";

const apiRequest: API.LoginRequest = { email, password };
const rpcRequest: RPC.LoginRequest = { ...apiRequest, correlationId };

this.authClient.send<RPC.LoginReply, RPC.LoginRequest>(
  { cmd: AUTH_COMMANDS.login },
  rpcRequest,
);
```

## Frontend State Architecture (User Portal)

The `user-portal` follows a contract/presenter/provider pattern for page state orchestration:

- Contract interfaces define state + actions consumed by pages
- Presenters implement those interfaces (current default uses React hooks)
- Providers inject the chosen presenter at app composition level

Presenters are organized by approach at folder level (for example: `src/state-contracts/home/presenters/hooks/`), similar to backend infra organization patterns.

Current examples in `user-portal`:

- Home uses `useHomeStateContract()` with `useHomeStatePresenter`
- Register uses `useRegisterStateContract()` with `useRegisterStatePresenter`
- Login uses `useLoginStateContract()` with `useLoginStatePresenter`
- MyPosts uses `useMyPostsStateContract()` with `useMyPostsStatePresenter`
- UserProfile uses `useUserProfileStateContract()` with `useUserProfileStatePresenter`
- Composition root uses `AppStateContractsProvider` to aggregate contract providers and prevent wrapper nesting in `App.tsx`

This keeps page components focused on rendering and makes state management implementation replaceable over time.

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
cp apps/image-service/.env.example apps/image-service/.env
cp apps/email-service/.env.example apps/email-service/.env
cp apps/event-handler-service/.env.example apps/event-handler-service/.env
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

## Logging and Observability (Loki + Grafana)

Backend services emit structured logs with Pino and now ship logs directly to Loki via `pino-loki`.

Current pipeline:

```text
api-gateway/auth-service/posts-service/image-service/friendship-service/email-service/event-handler-service
   -> nestjs-pino
   -> pino-loki transport
   -> Loki (http://localhost:3100)
   -> Grafana Explore/Dashboards (http://localhost:3002)
```

Required environment variables (already present in each service `.env.example`):

```env
LOGS_TO_LOKI=true
LOKI_HOST=http://localhost
LOKI_PORT=3100
```

Quick usage:

1. Start infra: `docker compose -f docker-compose.infra.yml up -d`
2. Start services: `pnpm dev`
3. Open Grafana at `http://localhost:3002` (admin/admin)
4. Go to Explore and run a query like:

```logql
{service="api-gateway", environment="development"} | json
```

Tip: filter by `correlationId` to trace a request across services.

Run a single app:

```sh
pnpm --filter api-gateway dev
pnpm --filter auth-service dev
pnpm --filter posts-service dev
pnpm --filter image-service dev
pnpm --filter friendship-service dev
pnpm --filter email-service dev
pnpm --filter event-handler-service dev
pnpm --filter user-portal dev
pnpm --filter user-portal storybook
pnpm --filter ui-showcase storybook
```

## Useful Scripts

- `pnpm dev`: Run all services in watch mode (Turbo)
- `pnpm build`: Build all services and packages
- `pnpm test`: Run all tests
- `pnpm lint`: Lint all code
- `pnpm check-types`: Type-check all packages
- `./kill-services.sh`: Stop known local app dev servers by project ports

When adding a new app with its own local dev port, update `kill-services.sh` in the same task to keep process cleanup accurate.

## Docker (Production Builds)

Each service has a production Dockerfile for deployment:

- [apps/api-gateway/Dockerfile](apps/api-gateway/Dockerfile)
- [apps/auth-service/Dockerfile](apps/auth-service/Dockerfile)
- [apps/posts-service/Dockerfile](apps/posts-service/Dockerfile)
- [apps/event-handler-service/Dockerfile](apps/event-handler-service/Dockerfile)

Email-service Dockerfile can be added when production containerization for this service is enabled.

## Environment Variables

- Per-service examples in `apps/*/.env.example`
- Root reference at [.env.example](.env.example)

## TODO

### Portal Features

- [ ] Reaction types (phase 2: extend from just "like" to emoji reactions)
- [ ] Friends/followers graph (follow/unfollow + follower/following lists)
- [ ] Notifications center (in-app + delivery channels)
- [ ] Privacy controls (public/private profiles and visibility rules)
- [ ] Reintroduce own-profile management UI on `/users/:username` (avatar upload + album/photo CRUD/edit placeholders)
- [ ] Backoffice UI (user management, content moderation, analytics dashboards)

### Infrastructure

- [ ] Email service integration (welcome emails)
- [ ] PostgreSQL integration (currently in-memory storage)
- [ ] Production docker-compose (all services)
- [ ] Observability platform (Datadog)
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Kubernetes deployment
- [ ] API documentation (Swagger)
- [ ] Code coverage reports
- [ ] Caching (Redis)
- [ ] Search service (Elasticsearch)

## Notes

- All packages are compiled to `dist/` and exported via their main field
