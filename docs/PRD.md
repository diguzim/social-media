# Product Requirements Document — Social Media Platform

> Status: **In Development** | Learning Project

---

## 1. Problem Statement

Build a full-featured social media platform from scratch as a learning vehicle for:

- Microservices architecture (NestJS TCP transport)
- Clean Architecture (domain / application / infra separation)
- Monorepo tooling (pnpm workspaces + Turborepo)
- Contract-driven API design
- E2E and unit testing patterns
- SQL + NoSQL databases (planned)

---

## 2. Users

| Persona         | Description                                           |
| --------------- | ----------------------------------------------------- |
| Registered User | Can post content, view a feed, manage their own posts |
| Guest           | Can view public feed (future)                         |

---

## 3. Features

### MVP (current)

| Feature                       | Status  | Notes                                 |
| ----------------------------- | ------- | ------------------------------------- |
| User registration             | ✅ Done | Email + password, stored in-memory    |
| User login / logout           | ✅ Done | JWT access tokens                     |
| View profile                  | ✅ Done | `/users/me` endpoint                  |
| Upload profile picture        | ✅ Done | JPG/PNG up to 2MB, resized to 200x200 |
| Create post                   | ✅ Done | Title + content (+ optional images)   |
| View home feed                | ✅ Done | Paginated, newest first               |
| View "My Posts"               | ✅ Done | Filtered by current user              |
| Enriched feed (`/posts/feed`) | ✅ Done | Author name resolved at gateway       |
| Edit own post                 | ✅ Done | Author-gated PATCH                    |
| Delete own post               | ✅ Done | Author-gated DELETE                   |

### Planned

| Feature                 | Priority | Notes                                                |
| ----------------------- | -------- | ---------------------------------------------------- |
| PostgreSQL persistence  | High     | Replace in-memory repos in auth + posts services     |
| MongoDB persistence     | High     | Explore NoSQL fit for posts                          |
| Friendship requests     | High     | Dedicated friendship-service (pending/accept/reject) |
| Like / reaction system  | Medium   | Event-driven via event-handler-service               |
| Comments                | Medium   | Flat comments CRUD in posts-service (initial)        |
| Follow / unfollow users | Medium   | Graph-like data                                      |
| Notifications           | Low      | WebSocket or polling                                 |
| Media uploads           | ✅ Done  | Optional post images (JPG/PNG/GIF, up to 10)         |
| OAuth / social login    | Low      | Google, GitHub                                       |
| Public guest feed       | Low      | No auth required                                     |

### Social Graph Backlog (TODO)

- Blocking users (`UserBlock`) to prevent requests/interactions
- Friendship suggestions (people you may know)
- Mutual friends computation and display
- Relationship privacy controls (who can send/view)
- Notification events for friend request accepted/rejected

---

## 4. Non-Functional Requirements

| Requirement        | Target                                                                |
| ------------------ | --------------------------------------------------------------------- |
| Type safety        | TypeScript strict mode everywhere                                     |
| Test coverage      | Unit tests for all use cases; E2E for all user-facing flows           |
| Observability      | Structured logs with correlationId on every request                   |
| Dev experience     | Single `pnpm dev` starts all services                                 |
| Contract integrity | Breaking contract changes require updating both producer and consumer |

---

## 5. Out of Scope (for now)

- Production deployment / cloud infrastructure
- Real-time features (WebSockets)
- Mobile clients
- Performance benchmarking / load testing
