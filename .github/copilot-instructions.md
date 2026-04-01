# GitHub Copilot Instructions

This is a **social media platform** monorepo built for learning purposes.
The project intentionally evolves over time: in-memory storage will be replaced by real databases (SQL + NoSQL) later.

## Monorepo Structure

- **pnpm workspaces** + **Turborepo** for orchestration
- `apps/` — deployable services and frontends
- `packages/` — shared libraries consumed by apps

```
apps/
  api-gateway/       # NestJS HTTP server (port 4000) — public-facing entry point
  auth-service/      # NestJS TCP microservice (port 4001) — user registration + JWT auth
  posts-service/     # NestJS TCP microservice (port 4002) — post CRUD
  image-service/     # NestJS TCP microservice (port 4004) — profile image upload/storage
  event-handler-service/ # NestJS — consumes domain events
  user-portal/       # React 18 + Vite + Tailwind CSS (port 3000)
  e2e/               # Cypress 13 E2E tests

packages/
  contracts/         # Shared TypeScript types — the source of truth for all API/RPC shapes
  events/            # Domain event definitions
  eslint-config/     # Shared ESLint config
  exception-filters/ # Shared NestJS exception filters
  log-context/       # Structured logging with correlation IDs
  typescript-config/ # Shared tsconfig bases
```

## Architecture Principles

### Contract Boundaries

`@repo/contracts` has two strict namespaces:

- `API` — shapes between **frontend ↔ API Gateway** (HTTP)
- `RPC` — shapes between **API Gateway ↔ microservices** (TCP)

**Never expose RPC types to the frontend. Never expose API types to microservices.**
The API Gateway is the anti-corruption layer and must transform between the two.

### Microservice Communication

- Services communicate via **NestJS TCP transport** using `ClientProxy`
- All RPC types live in `@repo/contracts` (RPC namespace)
- All HTTP API types live in `@repo/contracts` (API namespace)

### Gateway Enrichment Pattern

The `/posts/feed` endpoint in the API Gateway enriches raw posts with author details:

1. Fetches posts from posts-service
2. Extracts unique `authorId`s
3. Batch fetches user profiles from auth-service
4. Merges and returns enriched `FeedPost` (with `author: { id, name }`)

This avoids N+1 queries and keeps each microservice focused on its own domain.

### Current Database

Auth, posts, and image services use **in-memory repositories** behind repository interfaces.
When switching to real DBs, only the infra layer changes — domain and application layers are untouched.

When introducing a new domain/entity that is backed by an in-memory repository, always add deterministic seed data in the same task so the feature is manually verifiable right after boot (do not rely only on runtime creation through UI/tests).

## Tech Stack

| Layer                   | Technology                               |
| ----------------------- | ---------------------------------------- |
| Backend framework       | NestJS (TypeScript)                      |
| Frontend                | React 18 + Vite + Tailwind CSS           |
| Inter-service transport | NestJS TCP microservices                 |
| Auth                    | JWT (access tokens in localStorage)      |
| Package manager         | pnpm                                     |
| Build orchestration     | Turborepo                                |
| E2E tests               | Cypress 13                               |
| Unit tests              | Jest (backend), Vitest (frontend)        |
| Linting                 | ESLint with shared `@repo/eslint-config` |

## Coding Conventions

### General

- **TypeScript strict mode** everywhere
- Never use `any` unless explicitly necessary (and comment why)
- Prefer `interface` over `type` for object shapes in contracts
- Always use named exports (avoid `export default` except in React components)
- When adding or using environment variables (e.g., `process.env.*`), always declare them in `turbo.json` under `globalEnv` to prevent `turbo/no-undeclared-env-vars` lint errors

### NestJS / Backend

- Follow **Clean Architecture**: domain → application → infra layers
- Use cases live in `src/core/application/`
- Domain entities/repositories live in `src/core/domain/`
- Infrastructure (DB, external clients) in `src/infra/`
- All commands/queries go through use cases — no business logic in controllers
- Inject `ClientProxy` with `@Inject(TOKEN)` — never use `new`
- Always add `correlationId` to RPC requests (use `getCorrelationId()` from `@repo/log-context`)
- When a controller/service constructor gains a new injected dependency, update unit test modules (`Test.createTestingModule`) in the same task to include the new provider token/mocks (for example `IMAGE_SERVICE`) to avoid Nest DI failures

### Contracts (`@repo/contracts`)

- When adding a new contract, always update the relevant `index.ts` exports
- API contracts: `packages/contracts/src/api/`
- RPC contracts: `packages/contracts/src/rpc/`
- After editing contracts, run `pnpm build` from the root to regenerate dist

### Frontend (React)

- Components in `src/components/`, pages in `src/pages/`
- Services (API calls) in `src/services/`
- Prefer **state contracts** for page-level orchestration: define a contract interface (`state` + `actions`), implement a default presenter hook, and inject via provider at composition root
- Pages should consume contract hooks (e.g., `useHomeStateContract`, `useRegisterStateContract`, `useLoginStateContract`, `useMyPostsStateContract`) and stay focused on rendering/composition; avoid embedding heavy orchestration directly in page components
- Differentiate **page logic** from **component logic** explicitly:
  - Route/page orchestration (navigation, screen-level loading/error, cross-island coordination) belongs in page state contracts/presenters
  - Reusable component orchestration (card/form widget workflows) belongs in component-scoped hooks colocated with the component
  - Presentational UI components should receive state/actions via props and avoid direct service calls when a controller hook already exists
- Keep state contracts under `src/state-contracts/<feature>/` with clear boundaries between contract, presenter, and provider/context
- Aggregate presenters by implementation approach under `src/state-contracts/<feature>/presenters/<approach>/` (e.g., `presenters/hooks/`, `presenters/zustand/`, `presenters/redux/`) so architecture intent is obvious from folders
- Aggregate feature providers at composition root via a single app-level wrapper (e.g., `AppStateContractsProvider`) to avoid provider-wrapper nesting in `App.tsx`
- Break down oversized components when complexity grows. Prefer decomposition before adding more behavior when a component starts accumulating many local states/effects/handlers.
- Prefer this split for complex UI islands:
  - `ComponentName.tsx` (composition shell)
  - `component-name/use-*.ts` (control hooks)
  - `component-name/ComponentName*.tsx` (presentational slices)
  - optional `component-name/types.ts` (local view-model types/utilities)
- Keep lint complexity constraints as **soft limits** (warnings) to guide decomposition without blocking delivery.
- Storybook is colocated in `apps/user-portal` for frontend UI documentation and visual validation
- For new shared UI/loading components, add or update stories in `src/**/*.stories.tsx` in the same task
- For progressive loading UX changes, include stories that cover at least: initial load, section load, background refresh, and interaction pending
- Always use `data-testid` attributes on interactive elements and key containers
- JWT token stored in `localStorage` under key `jwtToken`
- User profile cached in `localStorage` under key `user`
- Prefer a **persistent shell** (layout + navbar) while route content updates; avoid full-page blocking loaders when partial UI can render
- Build pages as **UI islands** (independent sections) so already loaded sections remain visible while slower sections show local fallback UI
- Standardize loading into 4 scenarios: `initial-route-load`, `section-load`, `background-refresh`, `interaction-pending`
- Prefer **section-level `Suspense` boundaries** for slower islands; do not wrap the entire app in one coarse fallback
- Use **`useTransition` / `startTransition`** for non-urgent updates (filters, pagination, tab/route-like updates) so stale content can stay visible
- Use **`useDeferredValue`** for input-driven filtering/search to keep typing responsive
- Add **Error Boundaries per island** so one failed section does not collapse the entire page
- Use reusable loading primitives (e.g., section skeletons/placeholders) that support variable layout needs (`height`, `width`, `variant`, `lines`, `minHeight`)
- Prevent layout shift during loading (reserve space with skeleton containers/min heights)
- For form actions (login/register/create post), keep forms visible while pending: disable submit, show inline pending feedback, and prevent duplicate submissions
- Prefer request deduplication + abort stale requests + stale-while-revalidate behavior for smoother progressive rendering
- Default shared loading primitives should live under `src/components/loading/` (for example: `LoadingBlock`, `SectionSkeleton`, `PendingButton`, `InlineStatus`)
- Prefer introducing loading primitives before refactoring pages so page migrations reuse the same visual language
- Recommended first rollout order: `Home` page → `Profile` page → `MyPosts` page → shared form pending states
- For the `Home` page, prefer these initial islands: profile summary, create-post form, feed list
- On `Home`, avoid blocking the entire page on profile fetch when cached user data exists; render cached/stable content first and refresh in the background where possible
- Before finishing any frontend task in `apps/user-portal`, run `pnpm lint` in that app and resolve all lint errors; pay special attention to recurring issues: `no-unused-vars` (including callback param names in types), `no-unsafe-finally` (no `return` in `finally`), `react/no-unescaped-entities` (escape apostrophes in JSX text), and `no-undef` for React types (use explicit type imports like `ReactElement`)

### Testing

- **E2E tests use programmatic auth** via `cy.authenticateViaApi()` — never use UI forms for setup
- Treat `GET /posts/feed` as **protected** in E2E/API tests: requests must include `Authorization: Bearer <jwtToken>`
- Use `faker-js` for synthetic test data
- All fake test data must include a `Fake E2E` prefix in names
- Assert stable end-states, not transient loading states
- Prefer resilient E2E selectors based on `data-testid`; avoid brittle chains that depend on transient text/DOM ancestry (`contains(...).closest(...)`) when a deterministic test id can be used
- Keep E2E assertions aligned with current UI islands/composition. Do not assert removed Home profile-summary elements if Home renders create-post + feed islands instead
- Unit tests live alongside the code they test (`*.spec.ts`)
- For state-contract architecture, add tests that validate provider injection and custom presenter behavior (pages should work with swapped implementations)
- If tests or new behavior depend on baseline users/posts, update in-memory repository seed data in the same task (and keep test assertions aligned with the new seeded values)
- For each new in-memory domain/entity, seed at least one representative scenario set (for example: populated, empty, and ungrouped/unassigned when applicable) and add automated assertions (unit and/or E2E) that validate those seeded scenarios
- For progressive loading UX, assert that already-loaded regions remain visible while only pending islands show fallback UI
- For interaction-pending UX, test disabled submit controls, duplicate-submit prevention, and visible pending indicators
- In `apps/user-portal`, use `pnpm test`/`pnpm test:run` for one-shot runs and `pnpm test:watch` for interactive watch mode

### Documentation Maintenance

- Treat documentation updates as part of every coding task, not as optional follow-up work
- When changing behavior, architecture, contracts, setup, commands, ports, workflows, or testing strategy, update the relevant documentation in the same interaction before finishing
- Always review whether these files should change after implementation:
  - root `README.md`
  - app/package-level `README.md` files affected by the change
  - `docs/PRD.md` for feature scope or roadmap changes
  - `docs/ADR.md` when an architectural decision is introduced or changed
  - `.github/copilot-instructions.md` when project conventions or architecture guidance evolve
  - Storybook stories in `apps/user-portal/src/**/*.stories.tsx` when frontend component behavior/states change
- If no documentation change is needed, explicitly verify that the existing docs are still accurate before considering the task complete
- Prefer small, precise documentation updates that stay aligned with the code instead of leaving stale or aspirational text
- When updating TODO/checklist sections in docs, remove completed items instead of marking them as done (`[x]`); keep TODO lists focused on remaining work only

## Running the Project

```bash
# Start all services
pnpm dev

# Run E2E tests (requires services running)
cd apps/e2e && pnpm test:electron

# Run unit tests for a specific app
cd apps/api-gateway && pnpm test

# Build all packages
pnpm build
```

## Commonly Used Commands

| Command                             | What it does                                     |
| ----------------------------------- | ------------------------------------------------ |
| `pnpm dev`                          | Starts all apps in dev mode                      |
| `pnpm build`                        | Builds all packages and apps                     |
| `pnpm test`                         | Runs all workspace tests (including Cypress E2E) |
| `pnpm lint`                         | Lints all workspaces                             |
| `cd apps/e2e && pnpm test:electron` | Runs Cypress E2E in electron                     |

## Ports

| Service               | Port |
| --------------------- | ---- |
| user-portal (React)   | 3000 |
| api-gateway           | 4000 |
| auth-service          | 4001 |
| posts-service         | 4002 |
| event-handler-service | 4003 |
| image-service         | 4004 |
