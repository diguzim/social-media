# User Portal

React + Vite + TypeScript frontend application for user management.

## Getting Started

Install dependencies:

```sh
pnpm install
```

Run development server:

```sh
pnpm dev
```

Build for production:

```sh
pnpm build
```

## Project Structure

```
src/
  app/         - Application root and routing
  pages/       - Page components for routes
  components/  - Reusable UI components
  services/    - API clients and services
  hooks/       - Custom React hooks
```

## Scripts

- `pnpm dev` - Start development server (port 3000)
- `pnpm build` - Type-check and build production bundle
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checker

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## E2E Testing

Ready for Cypress or Playwright integration. Add as needed:

```sh
pnpm add -D cypress
pnpm add -D @playwright/test
```

## Notes

- Minimal setup, no CSS framework initially
- Functional components throughout
- Path alias ready to use: `src/*` maps to `src/`
