# Architecture Decision Records

Short records of significant technical decisions. Each ADR captures:
**context → decision → consequences**.

---

## ADR-001: API / RPC Contract Boundary

**Date:** 2026-03  
**Status:** Accepted

### Context

The project uses an API Gateway sitting in front of microservices. Early on, the gateway was leaking internal RPC types directly to the frontend, creating tight coupling.

### Decision

`@repo/contracts` enforces two strict namespaces:

- `API` — shapes used between **frontend ↔ API Gateway** (HTTP)
- `RPC` — shapes used between **API Gateway ↔ microservices** (TCP)

The API Gateway is the **anti-corruption layer**: it receives API types from the frontend and transforms them into RPC types before calling services.

### Consequences

✅ Frontend never sees internal service shapes  
✅ Services can evolve independently of the frontend  
✅ Adding a new service requires only a new RPC contract  
⚠️ Every new endpoint requires writing two contract shapes (API + RPC) and a gateway transform

---

## ADR-002: Gateway Enrichment for Feed

**Date:** 2026-03  
**Status:** Accepted

### Context

Posts only store `authorId`. Displaying author names requires resolving user data. Options considered:

1. **Gateway enrichment** — Gateway fetches posts then batch-resolves authors from auth-service
2. **Denormalization** — Store `authorName` inside the post at creation time
3. **JOIN** — Join users + posts inside one service (requires shared DB)
4. **N+1 in frontend** — Frontend fetches each user separately (rejected immediately)

### Decision

Implement **Gateway Enrichment** via a dedicated `/posts/feed` endpoint:

1. Gateway calls posts-service → receives `[{ authorId, ... }]`
2. Extracts unique `authorId`s
3. Batch-fetches profiles from auth-service
4. Merges and returns `FeedPost` with `author: { id, name }`

`/posts` (raw) remains unchanged for internal/machine use.

### Consequences

✅ Microservices stay isolated — each owns its own data  
✅ Auth-service is the single source of truth for user names  
✅ Easy to add more enrichments later (like counts, avatars)  
⚠️ Feed latency includes two serial service calls — mitigate later with caching  
⚠️ If auth-service is down, feed degrades gracefully to "Unknown User" (by design)

---

## ADR-003: In-Memory Repositories Behind Interfaces

**Date:** 2026-03  
**Status:** Accepted

### Context

Adding a real database early would add infrastructure complexity before the domain logic is proven.

### Decision

All services implement a `Repository` interface in the domain layer. The only concrete implementation is an in-memory array store in the infra layer.

### Consequences

✅ Can run the entire stack with `pnpm dev` — no Docker DB required  
✅ Domain and application layers have zero DB coupling  
✅ Switching to PostgreSQL or MongoDB only affects `src/infra/` — nothing else changes  
⚠️ In-memory state resets on restart — acceptable for learning purposes

---

## ADR-004: E2E Test Strategy

**Date:** 2026-03  
**Status:** Accepted

### Context

Early E2E tests used UI forms to register/login before each test, making tests slow and fragile.

### Decision

- **Programmatic auth:** `cy.authenticateViaApi()` registers + logs in via API calls, sets `localStorage` directly, then visits the page. No UI form interaction for setup.
- **Faker-generated data:** All test users use `faker-js` with a `Fake E2E` name prefix for traceability.
- **Stable assertions:** Tests only assert end-states, never transient loading states (e.g., "Creating..." button text).

### Consequences

✅ Tests are faster (no form round-trips for setup)  
✅ Tests are isolated — each test creates a fresh user  
✅ Fake data is easy to identify in logs  
⚠️ Tests depend on API availability — services must be running before E2E suite

---

## ADR-005: Email Verification Token Design

**Date:** 2026-03  
**Status:** Accepted

### Context

Email verification requires sending a secret link to the user. Options considered:

1. **Boolean flag only** — `isEmailVerified: boolean` — no proof of the action's timing
2. **Timestamp only** — `emailVerifiedAt: Date | null` — records when, but no external audit trail
3. **Token store with timestamp** — generate a token, persist a hash, confirm by consuming it — full auditability and token rotation
4. **Signed JWT as token** — self-contained, no DB round-trip — but can't be invalidated before expiry

### Decision

Use **Option 3: token store with timestamp**.

- `emailVerifiedAt: Date | null` on `User` — semantically richer than a boolean
- A separate `EmailVerificationToken` record stores the **SHA-256 hash** of the raw token (raw token only travels via email/URL, never persisted)
- 24h TTL, single-use (token is consumed on confirmation)
- Confirmation is **idempotent**: already-verified users return `already_verified` without re-consuming a token
- Auth-service generates and stores the token; the raw token is passed through `UserRegisteredEvent` so event-handler can embed it in the email link without possessing DB access

### Consequences

✅ Token exposure is minimised — only the SHA-256 hash is stored  
✅ Tokens auto-expire, preventing indefinite replay  
✅ Single-use prevents double-click / replay attacks  
✅ Idempotent confirmation is safe for retries  
✅ `emailVerifiedAt` provides an audit timestamp, not just a flag  
⚠️ Each resend creates a new token row — old tokens remain in the store until expiry  
⚠️ Dedicated resend event (`user.emailVerificationRequested`) adds one more routing key/handler path to maintain

---

## ADR-006: Comments in Posts-Service (Initial Scope)

**Date:** 2026-03  
**Status:** Accepted

### Context

The roadmap listed comments as a future standalone microservice. For initial delivery speed and simpler integration with existing feed/post ownership flows, the team needed an incremental implementation path.

### Decision

Implement comments **inside `posts-service`** first, with a flat model and full CRUD:

- create/list/update/delete comments for posts
- ownership checks for update/delete
- API Gateway exposes HTTP endpoints and translates to RPC comment commands
- frontend renders comments in Home and My Posts through shared PostCard UI

Threading/replies are out of scope for this phase.

### Consequences

✅ Faster delivery using existing infra, auth guards, and RPC plumbing  
✅ Reuses posts domain boundaries and ownership enforcement patterns  
✅ Keeps migration path open to split comments into a dedicated service later  
⚠️ `posts-service` grows in scope and may need extraction as complexity increases  
⚠️ Future split will require contract and data-migration planning

---

## ADR-007: Image-Service for Profile Pictures (Local Storage First)

**Date:** 2026-03  
**Status:** Accepted

### Context

The platform needs profile image uploads now, and post/comment images later. We want a simple local development implementation that can evolve to cloud object storage (for example S3) without rewriting application logic.

### Decision

Introduce a dedicated **`image-service`** microservice (TCP, port 4004) with its own contracts and clean boundaries:

- API Gateway accepts `multipart/form-data` uploads at `POST /users/avatar`
- Gateway forwards image payload to image-service through `RPC` contracts
- image-service validates JPG/PNG and 2MB limit, resizes to 200x200, and stores files through a storage provider abstraction
- Local implementation uses file storage (`IMAGE_STORAGE_DIR`) while preserving a replaceable provider interface for future S3 migration
- Gateway serves profile images through `GET /users/:userId/avatar` and enriches profile responses with `avatarUrl`

### Consequences

✅ Reusable image boundary for future post/comment media  
✅ Storage backend can be swapped without changing use cases/controllers  
✅ Keeps upload-specific logic out of auth/posts services  
⚠️ Adds one more microservice and TCP dependency in local dev  
⚠️ Current file serving happens in API Gateway; future CDN/object-store URLs may be preferable in production

---

## ADR-008: Frontend Component Decomposition and Logic/UI Separation

**Date:** 2026-03  
**Status:** Accepted

### Context

Page-level orchestration already uses state contracts and presenters, but some reusable components accumulated multiple workflows in single files (for example: post editing, media carousel, comments CRUD, and reactions in one card).

This increased cognitive load, made reviews slower, and raised regression risk when adding new behavior.

### Decision

Adopt a two-level frontend boundary:

1. **Page logic** (route orchestration, navigation, cross-island coordination) remains in `state-contracts/*` presenters.
2. **Component logic** (widget workflows and local async orchestration) moves to component-scoped hooks colocated with each complex component.
3. **UI slices** remain presentational and receive state/actions via props.

Recommended structure:

```text
ComponentName.tsx                # composition shell
component-name/use-*.ts          # control hooks
component-name/ComponentName*.tsx # presentational slices
component-name/types.ts          # local view types/utilities (optional)
```

Complexity constraints are initially **soft limits** (warnings/guidance), not hard delivery blockers.

### Consequences

✅ Clearer ownership between route orchestration and reusable component workflows  
✅ Smaller, testable units and easier targeted Storybook coverage  
✅ Safer incremental feature additions in complex UI islands  
⚠️ More files per feature and some prop-plumbing overhead  
⚠️ Teams must consistently apply the split to avoid drifting back to monolithic components

---

## ADR-009: Unified Design System and Monorepo UI Architecture

**Date:** 2026-04  
**Status:** Accepted

### Context

The project needs both:

- strong, explicit design-system directives (tokens, primitives, responsive rules, governance)
- monorepo-level reuse and ownership clarity for UI components

Without a unified directive, the team risks:

- inconsistent spacing/alignment and responsive behavior
- Storybook ownership ambiguity (component demos vs integration stories)
- duplicated implementation effort and drift across apps
- unclear testing ownership between reusable UI and product integration layers

### Decision

Adopt a **unified design system + monorepo UI architecture** with these directives.

Decision levels used below:

- **Must**: architecture boundaries and safety rails
- **Should**: strong defaults the team should generally follow
- **Note**: useful guidance or future-friendly ideas that do not need hard enforcement

#### 1) Naming and ownership boundaries

- Showcase/docs app: `apps/ui-showcase`
- Shared runtime package: `packages/ui` published as `@repo/ui`
- Product app scope: `apps/user-portal` keeps product integration/page concerns

#### 2) Token system

- Define tokens as CSS custom properties for spacing, color, typography, radius, shadow, and breakpoints.
- Tailwind consumes those tokens through config or CSS-variable-based utility mapping.
- Token names are a stable contract; changing names is a deliberate versioned decision.
- **Note:** exact token values and scales are implementation details, not ADR material.

#### 3) Theming

- Tokens must support theme switching through CSS variable overrides.
- Default themes are `light` and `dark`.
- Theme switching must not require component changes.
- Hardcoded colors in components should be avoided.
- **Note:** multi-brand support can be added later by layering brand overrides on the same theme system.

#### 4) Layout primitives

Core layout primitives remain first-class and reusable:

- `Container`
- `Stack`
- `Grid`
- `Section`

Requirements:

- token-driven spacing/colors/typography
- mobile-first responsive behavior
- `className` escape hatch
- stable `data-testid` passthrough

#### 5) Styling strategy

- Tailwind is the primary styling mechanism.
- Styling should come from tokens, Tailwind config, and component variants.

---

## ADR-010: Dedicated Email-Service with Sync RPC and Async Event Delivery

**Date:** 2026-04  
**Status:** Accepted

### Context

Email delivery started as a fake/logging side effect inside `event-handler-service`.
The platform now needs:

1. synchronous email operations callable over RPC
2. asynchronous email operations driven by RabbitMQ domain events
3. provider swappability (fake/logging in local environments, real provider in production)
4. delivery tracking visibility

Keeping all of this inside `event-handler-service` would over-couple unrelated concerns and make provider evolution harder.

### Decision

Introduce a standalone `email-service` microservice (TCP port 4006) that:

- exposes RPC commands under `RPC.EMAIL_COMMANDS`
- consumes `user.registered` and `user.emailVerificationRequested` from RabbitMQ
- supports provider selection by environment variable (`EMAIL_PROVIDER=logging|sendgrid|resend`)
- stores in-memory delivery records with lifecycle status (`queued`, `sending`, `sent`, `delivered`, `failed`, `bounced`)

`event-handler-service` keeps legacy user-email handlers but they are disabled by default using `EVENT_HANDLER_ENABLE_USER_EMAIL_HANDLERS=false` to avoid duplicate processing during migration.

### Consequences

✅ Email logic and provider integration are isolated in one service boundary  
✅ Both synchronous and asynchronous delivery paths are supported immediately  
✅ Real provider rollout can be toggled by configuration without code changes  
✅ Shared RPC contracts allow future gateway/user-triggered email workflows  
⚠️ One additional microservice increases operational complexity  
⚠️ Current delivery store is in-memory and resets on restart  
⚠️ Webhook reconciliation and retry orchestration remain incremental follow-up steps
- Arbitrary values should be rare and justified.
- Base components should keep a small variant surface such as `size`, `variant`, and `state`.
- Complex styling should live inside components, not be rebuilt ad hoc in apps.
- `cva` or an equivalent variant helper is the preferred way to manage variant classes, and `twMerge` (or equivalent) can be used to safely combine component defaults with `className` overrides.
- **Note:** exact linting/enforcement can stay lighter-weight and evolve over time.

#### 6) Component taxonomy

UI is structured in layers so ownership, testing, and extraction remain clear:

1. **Layout components**
   - purpose: layout and spacing building blocks
   - examples: `Container`, `Stack`, `Grid`, `Section`
   - extraction: first candidates for `@repo/ui`

2. **Base components**
   - purpose: minimal reusable controls with little visual opinion
   - examples: `Button`, `Input`, `Text`, `Heading`
   - extraction: must have package-local interaction, accessibility, and contract tests

3. **Composed components**
   - purpose: reusable components with stronger visual/behavioral defaults
   - examples: `Card`, `Modal`, `Dropdown`, `FormField`
   - extraction: only when they are reusable without product-specific orchestration

4. **Feature components**
   - purpose: product-specific UI that binds domain data, state, and flows together
   - examples: `UserCard`, `PostList`, `ProfileHeader`
   - extraction: remain app-owned unless they can be split into reusable sublayers

Taxonomy rules:

- layout components and many base components belong in `@repo/ui`
- composed components are extracted only when their behavior is not tightly coupled to `user-portal`
- feature components remain app-owned and are validated through integration tests

Proposed folder structure:

```text
packages/ui/
  src/
    layout-components/
    base-components/
    composed-components/

apps/user-portal/
  src/
    components/
      feature/
```

Folder rules:

- one component family per folder
- tests live next to the component
- story files live next to the component for showcase ownership
- `index.ts` files expose the public API for each layer
- feature components remain in `apps/user-portal` unless explicitly promoted

#### 7) Responsive strategy and breakpoints

- Use **mobile-first** approach as default: base styles first, progressive enhancement for larger viewports
- Standard breakpoint set:
  - `sm: 640px` (tablet portrait)
  - `md: 768px` (small desktop)
  - `lg: 1024px` (desktop)
  - `xl: 1280px` (large desktop)
- Layout primitives and utility usage must remain aligned with this breakpoint system
- Preserve DOM/source order by default; only change visual order when the responsive layout truly needs it.
- Use responsive direction changes for common row/column shifts; `Stack` should support vertical-to-horizontal flow, and `Grid` should support column-count changes across breakpoints.
- Hide, collapse, or remove content at breakpoints only for secondary or duplicated content; do not hide essential information from keyboard or reading order.
- When a layout change repeats across screens, prefer a primitive prop or a composed wrapper over one-off utility patches.
- `className` may be used for layout-only overrides, but the base responsive behavior should still be understandable from the component API.

#### 8) Storybook scope split

- Component demo stories belong to `apps/ui-showcase`
- `apps/user-portal` keeps integration/page stories only
- Avoid duplicate ownership of the same component demo across apps

#### 9) Runtime consumption model

- Apps consume reusable runtime UI through `@repo/ui`
- `apps/ui-showcase` demonstrates components; it is not the runtime ownership source

#### 10) Testing split

- `@repo/ui` must test extracted components internally (unit + interaction + accessibility + contract tests)
- `apps/user-portal` keeps integration tests, route/page tests, and e2e journey validation
- A component should not be considered extract-ready without package-local tests

#### 11) Accessibility requirements

Accessibility is part of the component contract, not optional.

All components in `@repo/ui` must:

- follow WAI-ARIA best practices
- support keyboard navigation
- expose proper roles and labels
- pass automated accessibility checks (for example, `axe`)

Accessibility failures block extraction and release in the shared UI package.

#### 12) State and behavior boundaries

- `@repo/ui` components may include UI behavior (for example: dropdown open/close, modal visibility, tab selection, focus management)
- Business logic must NOT exist in `@repo/ui`
- Async/data-fetching logic belongs to apps, not the shared UI package

This keeps `@repo/ui` reusable without turning it into a “smart UI package”.

#### 13) Governance, contract stability, and migration

- New and changed UI should continue to use tokens and primitives, preserve selector stability, and treat design primitives as public contracts.
- Breaking API changes need coordinated updates across apps.
- Story updates are required when responsive or component behavior changes.
- Storybook remains the visual contract for reusable UI behavior.
- **Note:** periodic drift checks are useful, but the exact cadence can stay flexible.

Migration phases:

1. Token/primitives hardening for shared consumption
2. Low-coupling primitives/controls first
3. Higher-coupling composed widgets after orchestration boundaries are isolated

- **Note:** extraction order can vary when a component is clearly reusable or clearly app-specific.

#### 14) Component API guidelines

- Component APIs should feel predictable and easy to compose.
- Prefer controlled + uncontrolled support when it adds value.
- Prefer composition and children/slots over prop explosion.
- Use consistent names such as `variant`, `size`, `as`, and `disabled`.
- Avoid boolean traps like `isSomething` or `hasSomething` when a simpler name works.
- **Note:** exact slot shapes and extra props can stay component-specific when needed.

#### 15) Performance considerations

- Avoid unnecessary re-renders.
- Prefer ESM named exports so unused components can be tree-shaken.
- Keep `@repo/ui` dependencies small and justified.
- Prefer headless patterns when a component becomes too complex for a simple styled wrapper.
- **Note:** bundle thresholds, profiler workflows, and performance audits can live in implementation docs or CI config.

### Consequences

✅ Single normative ADR for design-system and monorepo UI decisions  
✅ Reuse model is explicit (`@repo/ui` for runtime, `ui-showcase` for demos)  
✅ Reduced ambiguity for humans and AI tooling  
✅ Stronger regression safety via package-local UI tests + app integration/e2e tests  
✅ Explicit mobile-first and breakpoint standards reduce responsive regressions  
✅ Token governance reduces design drift and improves long-term maintainability

⚠️ Initial migration overhead (story split + packaging discipline)  
⚠️ More coordination across workspaces for build/test/release flow  
⚠️ Some feature-heavy widgets will remain app-local until decoupled
