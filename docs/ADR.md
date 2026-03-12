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
