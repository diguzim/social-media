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
