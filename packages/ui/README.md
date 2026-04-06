# @repo/ui

Shared runtime UI package for the monorepo.

## Scope

`@repo/ui` contains reusable UI primitives and components consumed by app frontends.

Current extraction scope:

- Layout primitives:
  - `Container`
  - `Stack`
  - `Grid`
  - `Section`
- Action primitives:
  - `Button`
- Menu primitives:
  - `DropdownMenu`
  - `DropdownMenuTrigger`
  - `DropdownMenuContent`
  - `FloatingPanel`
- Dialog primitives:
  - `Modal`

## Principles

- Mobile-first responsive behavior
- Token-driven styling
- Stable `data-testid` passthrough
- Reusable UI behavior only (no business logic, no data fetching)

## Usage

```tsx
import {
  Button,
  Container,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FloatingPanel,
  Grid,
  Modal,
  Section,
  Stack,
} from "@repo/ui";
```

## Build

```sh
pnpm --filter @repo/ui build
```

## Type-check

```sh
pnpm --filter @repo/ui check-types
```
