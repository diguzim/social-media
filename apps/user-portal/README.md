# User Portal

React + Vite + TypeScript frontend SPA for user authentication and account management.

## Features

- User registration with name, username, email, and password
- JWT-based login and authentication
- Email verification flow (verify link + resend banner)
- Unified profile page (avatar, name, username, stats) served by `/users/:username` for both self and public views
- URL-driven tabbed profile sections: Timeline, Photos, About, Friends, Personal Data
- Photos tab supports an albums-first experience (horizontal album cards + drill-in gallery) and photo modal viewing
- Accepted-friends list in profile tabs (current-user data wired; public-user list placeholder until backend support)
- Friends page for accepted friends plus incoming/outgoing pending requests
- Client-side routing with React Router v6
- JWT token storage in localStorage
- Progressive loading UX with persistent shell + Home page islands
- Loading states and error handling
- Like/unlike posts with optimistic updates and reaction counts
- Flat comments CRUD directly on post cards (create, list, edit own, delete own)
- Feed cards show author avatar + profile link in the header (fallback initial when no avatar)
- Storybook for visual component validation and loading state scenarios
- Pluggable frontend state architecture via state contracts (interfaces + injectable presenters)

## Routes

- `/` - Protected home page showing user data
- `/register` - User registration form
- `/login` - User login form
- `/users/:username` - Protected public profile page (defaults to Timeline)
- `/users/:username/:section` - Protected public profile section route (`timeline|photos|about|friends|personal`)
- `/friends` - Protected friendship management page (friends + pending requests)
- `/verify-email?token=...` - Public email confirmation page
- `*` - 404 Not Found page (any unmatched route)

## Authentication Flow

1. **Register** - User creates account
   - Form validates and submits to `POST /users` (api-gateway)

- Redirects to login page on success; verification email is sent automatically

2. **Login** - User authenticates

- Form submits to `POST /users/login` (api-gateway) using email or username plus password

- JWT token stored in localStorage (`jwtToken`)
- User profile fetched from `GET /users/me` and cached in localStorage (`user`)
- Redirects to Home page

3. **Protected Area** (`/`, `/users/:username`)

- Protected by route guard (requires `jwtToken` + `user` in localStorage)
- Home shows welcome + user info
- Unified user profile shows dedicated profile view with a verified badge in the header card when applicable
- Logout clears auth data and redirects to login
- Unverified users see a yellow banner with a "Resend verification email" button

4. **Email Verification**

- Clicking the link in the verification email loads `/verify-email?token=...`
- Page calls `POST /users/email-verification/confirm` and shows success/already-verified/error state
- Verified accounts show a badge in the profile card

## Data Storage

- **JWT Token** - localStorage key `jwtToken` (from login response)
- **User Profile** - localStorage key `user` (from /users/me response)
  - Structure: `{ id, name, username, email, emailVerifiedAt, avatarUrl? }`

## Test Selectors (`data-testid`)

UI elements used in E2E/Playwright flows expose `data-testid` attributes.

Examples:

- Login: `login-email-input`, `login-password-input`, `login-submit-button`
- Register: `register-name-input`, `register-username-input`, `register-email-input`, `register-submit-button`
- Home: `home-page`, `home-create-post-section`, `home-feed-section`
- Navbar: `navbar-menu-button`, `navbar-profile-link`, `navbar-logout-button`
- UserProfile: `user-profile-card`, `user-profile-stats`, `user-profile-posts-list`
- UserProfile tabs: `user-profile-sections-tab-*`, `user-profile-photos-section`, `user-profile-about-section`, `user-profile-friends-section`, `user-profile-personal-section`

These attributes are stable hooks for automated tests and should be kept backward-compatible when possible.

## API Integration

All requests go through the API Gateway at `http://localhost:4000`:

```typescript
- POST /users (register)
- POST /users/login
- GET /users/me (requires Authorization: Bearer {token})
- GET /users/:username/profile (requires Authorization: Bearer {token})
- POST /friends/requests (requires auth)
- POST /friends/requests/:requestId/accept (requires auth)
- POST /friends/requests/:requestId/reject (requires auth)
- GET /friends (requires auth)
- GET /friends/requests/incoming (requires auth)
- GET /friends/requests/outgoing (requires auth)
- GET /friends/status/:username (requires auth)
- POST /users/avatar (requires auth; multipart image upload)
- GET /users/:userId/avatar (public image stream)
- GET /users/:username/photos (requires auth)
- GET /users/:userId/photos/:photoId (public image stream used by profile photos galleries)
- POST /users/me/albums (requires auth)
- PATCH /users/me/albums/:albumId (requires auth; supports `name`, `description`, and `coverPhotoId`)
- DELETE /users/me/albums/:albumId (requires auth)
- POST /users/me/photos (requires auth; multipart image upload)
- PATCH /users/me/photos/:photoId (requires auth)
- DELETE /users/me/photos/:photoId (requires auth)
- GET /posts?page=1&limit=10&sortOrder=desc
- GET /posts/feed (requires auth; feed with author enrichment, optional author avatarUrl, like counts + likedByMe)
- POST /posts/:id/reactions (like/unlike a post)
- GET /posts/:id/comments (list comments for a post)
- POST /posts/:id/comments (create comment)
- PATCH /posts/:postId/comments/:commentId (update own comment)
- DELETE /posts/:postId/comments/:commentId (delete own comment)
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
  pages/          - Page components (Home, Register, Login, Profile, Friends)
  components/     - Reusable UI components (e.g., Navbar, Feed, PostCard)
  components/loading/ - Shared loading primitives (skeletons, pending buttons, inline status)
  components/home/ - Home page island components
  state-contracts/ - Frontend state contracts, presenters, and providers (replaceable state management)
  services/       - API clients (auth.ts, posts.ts, friends.ts)
  hooks/          - Custom React hooks (placeholder)
```

## Frontend State Contracts (Pluggable State Management)

The portal adopts a backend-inspired architecture for state orchestration:

- **Contracts** define page state + actions (e.g., `HomeStateContract`)
- **Presenters** implement those contracts using the current strategy (today: React hooks + local state/effects)
- **Providers** inject which presenter is active at composition root
- **Pages** consume only the contract, keeping UI components simple and implementation-agnostic

Current rollout:

- Home page uses `StateContractsProvider` + `useHomeStateContract()`
- Register page uses `RegisterStateContractProvider` + `useRegisterStateContract()`
- Login page uses `LoginStateContractProvider` + `useLoginStateContract()`
- MyPosts page uses `MyPostsStateContractProvider` + `useMyPostsStateContract()`
- Profile page uses `ProfileStateContractProvider` + `useProfileStateContract()`
- UserProfile page uses `UserProfileStateContractProvider` + `useUserProfileStateContract()`
- Friends page uses `FriendsStateContractProvider` + `useFriendsStateContract()`
- Default presenter is `useHomeStatePresenter` under the hooks approach folder
- Default register presenter is `useRegisterStatePresenter` under the hooks approach folder
- Default login presenter is `useLoginStatePresenter` under the hooks approach folder
- Default my-posts presenter is `useMyPostsStatePresenter` under the hooks approach folder
- Default profile presenter is `useProfileStatePresenter` under the hooks approach folder
- Default user-profile presenter is `useUserProfileStatePresenter` under the hooks approach folder
- Composition root uses `AppStateContractsProvider` to aggregate providers and avoid provider-wrapper nesting in `App.tsx`

Current folder convention (by implementation approach):

```text
src/state-contracts/home/
  home-state.contract.ts              # contract definition
  home-state-contract.context.tsx     # provider + consumer hook
  presenters/
    hooks/
      use-home-state.presenter.ts     # hooks-based presenter

src/state-contracts/register/
  register-state.contract.ts          # contract definition
  register-state-contract.context.tsx # provider + consumer hook
  presenters/
    hooks/
      use-register-state.presenter.ts # hooks-based presenter

src/state-contracts/login/
  login-state.contract.ts             # contract definition
  login-state-contract.context.tsx    # provider + consumer hook
  presenters/
    hooks/
      use-login-state.presenter.ts    # hooks-based presenter

src/state-contracts/my-posts/
  my-posts-state.contract.ts          # contract definition
  my-posts-state-contract.context.tsx # provider + consumer hook
  presenters/
    hooks/
      use-my-posts-state.presenter.ts # hooks-based presenter

src/state-contracts/profile/
  profile-state.contract.ts           # contract definition
  profile-state-contract.context.tsx  # provider + consumer hook
  presenters/
    hooks/
      use-profile-state.presenter.ts  # hooks-based presenter

src/state-contracts/user-profile/
  user-profile-state.contract.ts              # contract definition
  user-profile-state-contract.context.tsx     # provider + consumer hook
  presenters/
    hooks/
      use-user-profile-state.presenter.ts     # hooks-based presenter
```

When adding a new state strategy, create a sibling approach folder (for example `presenters/zustand/` or `presenters/redux/`) and keep pages unchanged.

This allows replacing internals later (Context-only, Zustand, Redux Toolkit, or another approach) without rewriting Home, Register, Login, or MyPosts page composition.

## Component Decomposition and Control/UI Split

Besides page-level state contracts, reusable components follow a component-scoped controller pattern:

- **Page logic** stays in page contracts/presenters (route orchestration, navigation, screen-level loading/error)
- **Component logic** stays in colocated hooks near the component (widget workflows, local async interactions)
- **UI slices** stay presentational and receive state/actions via props

Recommended structure for complex components:

```text
src/components/<feature>/
  ComponentName.tsx                # composition shell
  component-name/
    use-*.ts                       # control hooks (async/data/event orchestration)
    ComponentName*.tsx             # presentational slices
    types.ts                       # local view-model types/utilities (optional)
```

Soft decomposition thresholds (warning-level guidance):

- avoid accumulating many local `useState` + `useEffect` blocks in one component
- split when a component starts mixing multiple domains (example: media carousel + comments + edit workflow + reactions)
- prefer extracting behavior to hooks before adding new responsibilities to an already large component

## Scripts

- `pnpm dev` - Start development server (port 3000)
- `pnpm build` - Type-check and build production bundle
- `pnpm storybook` - Start Storybook for visual UI validation (port 6006)
- `pnpm build-storybook` - Build static Storybook docs
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checker

## Storybook

Storybook is colocated in `apps/user-portal` so portal UI can be validated in isolation while the design system evolves.

- Config: `.storybook/main.ts` and `.storybook/preview.ts`
- Initial stories cover loading primitives and Home loading scenarios:
  - `src/components/loading/*.stories.tsx`
  - `src/components/home/HomeProfileSummary.stories.tsx`
  - `src/stories/HomeLoadingScenarios.stories.tsx`

Run:

```sh
pnpm --filter user-portal storybook
```

Build static docs:

```sh
pnpm --filter user-portal build-storybook
```

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
  - `uploadProfileAvatar()` - POST /users/avatar (multipart upload)
  - `getUserProfile()` - Retrieve cached profile from localStorage
- `posts.ts` provides:
  - `getPosts()` - GET /posts with pagination/filter query params
  - `getFeed()` - GET /posts/feed (requires auth; author-enriched with reaction counts and likedByMe)
  - `createPost()` - POST /posts (requires auth)
  - `togglePostReaction()` - POST /posts/:id/reactions (like/unlike, requires auth)

## Notes

- Styled with Tailwind utility classes and shared component classes in `src/styles.css`
- Functional components throughout
- localStorage handles persistence across page reloads
- JWT token sent in Authorization header for protected endpoints
- Error states display user-friendly error messages
- Home uses cached-first rendering for profile data and refreshes in the background when possible
- Feed refreshes preserve already rendered posts and show local refresh feedback instead of blanking the page
- Home feed, My Posts, and User Profile use infinite scroll (IntersectionObserver + paginated `/posts/feed` requests)
- Feed, My Posts, and User Profile share a common paginated posts data hook for refresh/load-more behavior
- UserProfile header includes placeholder social counters (`Following`, `Followers`, `Friends`) for future backend integration
- About and Personal Data currently render frontend placeholders while backend schema/endpoints are pending
- UserProfile friends tab shows accepted friends only when viewing self; public accepted-friends listing remains TODO in backend/API
- Like button uses optimistic updates: UI updates immediately, reverts on network error
- PostCard displays like count and "liked by me" status from reaction summary

## TODO

- [ ] Reintroduce own-profile management actions in unified user profile (`/users/:username`) when product flow is defined (avatar upload, album/photo CRUD, About/Personal edit actions)
