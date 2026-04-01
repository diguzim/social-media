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

## ADR-009: Design System Architecture (Tokens, Primitives, Responsive Layout)

**Date:** 2026-04  
**Status:** Accepted

### Context

The `apps/user-portal` frontend currently styles UI via ad-hoc Tailwind utility classes and a small set of CSS classes (`.page-container`, `.card`, `.btn-*`) in `src/styles.css`. There is no formal:

- **Design tokens** (spacing, colors, typography, breakpoints)
- **Layout system** (primitives for responsive containers, stacks, grids, sections)
- **Governance** (compliance rules, migration strategy, component contract stability)

This lack of structure creates:

- Inconsistent spacing and alignment across pages
- Difficulty onboarding new contributors to responsive patterns
- Risk of visual regressions when refactoring components (no predictable primitives to anchor on)
- No single source of truth for breakpoints and responsive behavior
- Scattered stories in Storybook without a cohesive token/primitive narrative

### Decision

Establish a **Design System for `apps/user-portal`** with four pillars:

#### 1. Token System (CSS Variables + Tailwind Mapping)

- Define design tokens as **CSS custom properties (variables)** in `apps/user-portal/src/styles.css`:
  - `--space-*` for spacing (4px, 8px, 16px, 24px, 32px, 48px units)
  - `--color-*` for brand colors and semantic roles (`--color-bg`, `--color-text`, `--color-accent`, `--color-border`, etc.)
  - `--type-*` for typography (font sizes, weights, line heights)
  - `--radius-*` for border radii (`--radius-sm`, `--radius-md`, `--radius-lg`)
  - `--shadow-*` for elevation levels
  - `--breakpoint-*` for responsive breakpoints (mobile-first: `--breakpoint-sm`, `--breakpoint-md`, `--breakpoint-lg`)

- **Map tokens into Tailwind** via `tailwind.config.ts`:
  - `spacing: { ... }` reads `--space-*` variables
  - `colors: { ... }` reads `--color-*` variables
  - `fontSize: { ... }` reads `--type-*` variables
  - `borderRadius: { ... }` reads `--radius-*` variables
  - `boxShadow: { ... }` reads `--shadow-*` variables
  - `screens: { ... }` reads `--breakpoint-*` variables

- **Token source of truth**: CSS variables (single file, easy audit)
- **Scope**: **`apps/user-portal` only** in this ADR; future monorepo-wide extraction planned as a separate ADR

#### 2. Layout Primitives

Define explicit **layout building blocks** (as React components in `apps/user-portal/src/components/layout/`):

- **`Container`** — full-width responsive wrapper with max-width and centered padding
- **`Stack`** — vertical or horizontal flex layout with consistent gap (xy-axis direction, adjustable via props)
- **`Grid`** — responsive multi-column layout with configurable columns per breakpoint
- **`Section`** — semantic grouping with padding + optional background/border

Each primitive:

- Uses design tokens for spacing, gaps, and responsive breakpoints
- Exposes props for common customizations (e.g., `gap`, `columns`, `align`, `justify`)
- Accepts `className` for utility extensions (Tailwind fallback)
- Includes Storybook stories showing all responsive breakpoints
- Is testable via deterministic selectors (`data-testid`)

Existing reusable components like `LoadingBlock`, `SectionSkeleton`, `PendingButton` integrate with primitives through consistent token usage.

#### 3. Responsive Breakpoint Strategy

- **Mobile-first approach**: base styles for mobile, then `@media (min-width: ...)` for larger screens
- **Standard breakpoints** (aligned with Tailwind defaults but enforced via tokens):
  - `sm: 640px` — tablet portrait
  - `md: 768px` — small desktop
  - `lg: 1024px` — desktop
  - `xl: 1280px` — large desktop
- **Usage pattern**: token-based breakpoints in Tailwind utilities + component props (e.g., `columns={{ sm: 1, md: 2, lg: 3 }}`)

#### 4. Governance and Compliance

**New/Changed UI Compliance:**

- All new components or pages must use design primitives from `components/layout/` for major layouts
- All new components must use design tokens for spacing, colors, and typography
- Token usage validated via setup to warn (e.g., ESLint rule or TypeScript strict type checking based on accepted token exhaustive props)

**Legacy Migration:**

- Existing pages/components can use ad-hoc utilities during refactoring (no retrofit requirement)
- When a page/component is actively being refactored or extended, migrate its layout patterns to use new primitives
- Phased migration order (for consistency):
  1. `Home` page (primary user journey, high visibility)
  2. `Profile` / `UserProfile` page (user-facing identity surface)
  3. `MyPosts` page (content management surface)
  4. Account settings pages (admin surface)
  5. Shared form components (reuse amplifier)
  6. Other routes as needed

**Component Contract Stability:**

- Design primitives are **public contracts** — breaking changes require team discussion and Storybook story updates
- Component selectors (`data-testid`) must remain stable across token/primitive updates
- Storybook stories must be updated whenever a component's responsive behavior changes
- E2E tests depend on `data-testid` selectors; ensure selectors are unaffected by style changes

**Drift Detection:**

- Quarterly audit: scan codebase for hardcoded spacing/colors outside token system (via ESLint or manual inspection)
- Storybook serves as the visual contract — if a story looks different than design intent, re-align the token values or primitive logic
- Design system README in `apps/user-portal` documents current tokens, primitives, and usage examples

### Consequences

✅ **Consistency:** All pages use the same spacing scales, colors, typography — improved visual coherence  
✅ **Maintainability:** Tokens are centralized in one file — changes propagate automatically via Tailwind + CSS vars  
✅ **Accessibility:** Semantic primitives (e.g., `role="region"` on `Section`) improve screen-reader support  
✅ **Documentation:** Storybook stories + design system README make onboarding faster for new contributors  
✅ **Refactoring safety:** Primitives and tokens act as anchors — CSS changes are less risky when styling is predictable  
✅ **Responsive UX:** Explicit breakpoints and layout primitives reduce responsive layout bugs

⚠️ **Adoption overhead:** Contributors must learn token naming and primitive APIs — initial slower iteration  
⚠️ **CSS var overhead:** CSS variables add a small runtime layer (negligible for this app scale)  
⚠️ **Legacy code:** Existing pages use ad-hoc utilities; design system doesn't enforce retrofit (intentionally lenient on legacy)  
⚠️ **Future refactoring:** If later extracted to a shared monorepo package, token definitions may need restructuring

### Adoption Sequence

1. **Phase 1 (Week 1):** Define tokens in `src/styles.css`, map into `tailwind.config.ts`, create layout primitives (`Container`, `Stack`, `Grid`, `Section`), document in `apps/user-portal/README.md`
2. **Phase 2 (Week 2–3):** Migrate `Home` page and update its Storybook stories to showcase responsive behavior
3. **Phase 3 (Week 4+):** Iteratively migrate remaining high-value pages (Profile, MyPosts, Account settings); update E2E selectors if needed
4. **Ongoing:** All new UI must comply; legacy migrates incrementally when touched
