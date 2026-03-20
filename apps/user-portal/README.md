# User Portal

React + Vite + TypeScript frontend SPA for user authentication and account management.

## Features

- User registration with email/password
- JWT-based login and authentication
- Email verification flow (verify link + resend banner)
- User profile page with email verification status
- Client-side routing with React Router v6
- JWT token storage in localStorage
- Progressive loading UX with persistent shell + Home page islands
- Loading states and error handling

## Routes

- `/` - Protected home page showing user data
- `/register` - User registration form
- `/login` - User login form
- `/profile` - Protected profile page with verification status
- `/verify-email?token=...` - Public email confirmation page
- `*` - 404 Not Found page (any unmatched route)

## Authentication Flow

1. **Register** - User creates account
   - Form validates and submits to `POST /users` (api-gateway)

- Redirects to login page on success; verification email is sent automatically

2. **Login** - User authenticates
   - Form submits to `POST /users/login` (api-gateway)

- JWT token stored in localStorage (`jwtToken`)
- User profile fetched from `GET /users/me` and cached in localStorage (`user`)
- Redirects to Home page

3. **Protected Area** (`/`, `/profile`)

- Protected by route guard (requires `jwtToken` + `user` in localStorage)
- Home shows welcome + user info
- Profile shows dedicated profile view with `emailVerifiedAt` status
- Logout clears auth data and redirects to login
- Unverified users see a yellow banner with a "Resend verification email" button

4. **Email Verification**

- Clicking the link in the verification email loads `/verify-email?token=...`
- Page calls `POST /users/email-verification/confirm` and shows success/already-verified/error state
- Profile page shows "Verified on {date}" or "Not yet verified"

## Data Storage

- **JWT Token** - localStorage key `jwtToken` (from login response)
- **User Profile** - localStorage key `user` (from /users/me response)
  - Structure: `{ id, name, email, emailVerifiedAt }`

## Test Selectors (`data-testid`)

UI elements used in E2E/Playwright flows expose `data-testid` attributes.

Examples:

- Login: `login-email-input`, `login-password-input`, `login-submit-button`
- Register: `register-name-input`, `register-email-input`, `register-submit-button`
- Home: `home-welcome-title`, `home-profile-card`, `home-logout-button`
- Navbar: `navbar-menu-button`, `navbar-profile-link`, `navbar-logout-button`

These attributes are stable hooks for automated tests and should be kept backward-compatible when possible.

## API Integration

All requests go through the API Gateway at `http://localhost:4000`:

```typescript
- POST /users (register)
- POST /users/login
- GET /users/me (requires Authorization: Bearer {token})
- GET /posts?page=1&limit=10&sortOrder=desc
- POST /users/email-verification/confirm (public — confirms token from email link)
- POST /users/email-verification/request (requires auth — resend verification email)
```

Request/response typing is shared from `@repo/contracts/api` to keep frontend and gateway aligned on the public HTTP boundary.

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
  pages/          - Page components (Home, Register, Login, Profile)
  components/     - Reusable UI components (e.g., Navbar, Feed, PostCard)
  components/loading/ - Shared loading primitives (skeletons, pending buttons, inline status)
  components/home/ - Home page island components
  services/       - API clients (auth.ts and posts.ts)
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
- **Tailwind CSS** - Utility-first styling
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Service Integration

The app communicates with the API Gateway which routes requests to microservices:

- `auth.ts` provides:
  - `registerUser()` - POST /users
  - `loginUser()` - POST /users/login (stores JWT in localStorage)
  - `getProfile()` - GET /users/me (stores user profile in localStorage)
  - `getUserProfile()` - Retrieve cached profile from localStorage
- `posts.ts` provides:
  - `getPosts()` - GET /posts with pagination/filter query params

## Notes

- Styled with Tailwind utility classes and shared component classes in `src/styles.css`
- Functional components throughout
- localStorage handles persistence across page reloads
- JWT token sent in Authorization header for protected endpoints
- Error states display user-friendly error messages
- Home uses cached-first rendering for profile data and refreshes in the background when possible
- Feed refreshes preserve already rendered posts and show local refresh feedback instead of blanking the page
