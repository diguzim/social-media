# @repo/contracts

Shared contract package for service boundaries.

## Contract Boundaries

- `API` contracts (`src/api/*`): frontend ↔ API gateway HTTP contracts
- `RPC` contracts (`src/rpc/*`): API gateway ↔ microservices TCP contracts

The API gateway acts as the translator between these boundaries.

## Exports

- Root namespace exports:
  - `API`
  - `RPC`
  - Command constants (`AUTH_COMMANDS`, `POST_COMMANDS`)

- Subpath exports:
  - `@repo/contracts/api`
  - `@repo/contracts/rpc`

## Example

```ts
import { AUTH_COMMANDS } from "@repo/contracts";
import type { API, RPC } from "@repo/contracts";

const apiPayload: API.LoginRequest = {
  email: "user@example.com",
  password: "Secret123!",
};

const rpcPayload: RPC.LoginRequest = {
  ...apiPayload,
  correlationId: "corr-123",
};
```

## Build

```sh
pnpm --filter contracts build
```
