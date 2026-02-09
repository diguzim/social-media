# Social Media Monorepo

Microservices monorepo powered by Turborepo and pnpm. It includes an API gateway, an auth service, and a shared contracts package that defines message commands and DTOs.

## Stack

- Node.js (>=18)
- pnpm workspaces
- Turborepo
- NestJS microservices (TCP transport)

## Apps

- `api-gateway`: HTTP entrypoint for clients
- `auth-service`: Auth microservice listening on TCP port 4000

## Packages

- `@repo/contracts`: Shared message contracts and commands
- `@repo/eslint-config`: Shared ESLint configuration
- `@repo/typescript-config`: Shared TypeScript base config

## Contracts

The API gateway and microservices share message contracts through `@repo/contracts`.

Example usage:

```ts
import { AUTH_COMMANDS } from '@repo/contracts';
import type { RegisterRequest, RegisterReply } from '@repo/contracts';

this.authClient.send<RegisterReply>({ cmd: AUTH_COMMANDS.register }, payload);
```

## Getting Started

Install dependencies:

```sh
pnpm install
```

Build all packages/apps:

```sh
pnpm build
```

Run all services in dev mode:

```sh
pnpm dev
```

Run a single app:

```sh
pnpm --filter api-gateway dev
pnpm --filter auth-service dev
```

## Useful Scripts

- `pnpm dev`: Run all apps in watch mode (Turbo)
- `pnpm build`: Build all apps and packages
- `pnpm lint`: Lint all apps and packages
- `pnpm check-types`: Type-check all packages

## Ports

- API Gateway: 3000
- Auth Service (TCP): 4000

## Notes

- The contracts package is compiled to `dist/` and exported from there.
- If port 3000 is already in use, stop the other process or set `PORT` before running `pnpm dev`.
