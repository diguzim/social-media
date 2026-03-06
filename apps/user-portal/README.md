# User Portal

React + Vite + TypeScript frontend SPA for user authentication and account management.

## Features

- User registration with email/password
- JWT-based login and authentication
- User profile page with persistent session
- Client-side routing with React Router v6
- JWT token storage in localStorage
- Loading states and error handling

## Routes

- `/` - Home page with navigation links
- `/register` - User registration form
- `/login` - User login form
- `/welcome` - Protected welcome page showing user profile (after successful login)

## Authentication Flow

1. **Register** - User creates account
   - Form validates and submits to `POST /users` (api-gateway)
   - Redirects to login page on success

2. **Login** - User authenticates
   - Form submits to `POST /users/login` (api-gateway)
   - JWT token stored in localStorage
   - Redirects to Welcome page

3. **Welcome** - Protected profile page
   - Fetches `GET /users/me` with Bearer token
   - Stores user profile in localStorage
   - Displays user details
   - Logout button clears tokens and returns to home

## Data Storage

- **JWT Token** - localStorage key `token` (from login response)
- **User Profile** - localStorage key `user` (from /users/me response)
  - Structure: `{ id, name, email }`

## API Integration

All requests go through the API Gateway at `http://localhost:4000`:

```typescript
- POST /users (register)
- POST /users/login
- GET /users/me (requires Authorization: Bearer {token})
```

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
  app/            - Application root and routing
  pages/          - Page components (Home, Register, Login, Welcome)
  components/     - Reusable UI components (placeholder)
  services/       - API clients (auth.ts with register, login, getProfile)
  hooks/          - Custom React hooks (placeholder)
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
- **TypeScript 5.7** - Type safety
- **React Router v6** - Client-side routing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Service Integration

The app communicates with the API Gateway which routes requests to microservices:

- `auth.ts` provides:
  - `registerUser()` - POST /users
  - `loginUser()` - POST /users/login (stores JWT in localStorage)
  - `getProfile()` - GET /users/me (stores user profile in localStorage)
  - `getUserProfile()` - Retrieve cached profile from localStorage

## Notes

- Minimal styling, no CSS framework
- Functional components throughout
- localStorage handles persistence across page reloads
- JWT token sent in Authorization header for protected endpoints
- Error states display user-friendly error messages
