# User Portal

React + Vite + TypeScript frontend SPA for user authentication and account management.

## Features

- User registration with name, username, email, and password
- JWT-based login and authentication
- Email verification flow (verify link + resend banner)
- Unified profile page (avatar, name, username, stats) served by `/users/:username` for both self and public views
- Ownership differentiation is explicit on `/users/:username`: route username is compared with authenticated user username to drive self/public behavior
- URL-driven tabbed profile sections: Timeline, Photos, About, Friends, Personal Data
- Photos section uses nested routes with Unsorted and Albums tabs, plus album detail navigation and photo modal viewing
- Dedicated account-management area with left-side vertical navigation and URL subroutes under `/account/*`
- Accepted-friends list in profile tabs (current-user data wired; public-user list placeholder until backend support)
- Friends page for accepted friends plus incoming/outgoing pending requests
- Client-side routing with React Router v6
- JWT token storage in localStorage
- Progressive loading UX with persistent shell + Home page islands
- Loading states and error handling
- Like/unlike posts with optimistic updates and reaction counts
- Flat comments CRUD directly on post cards (create, list, edit own, delete own)
- Feed cards show author avatar + profile link in the header (fallback initial when no avatar)
- Shared layout primitives consumed from `@repo/ui` (`Container`, `Stack`, `Grid`, `Section`)
- Storybook for visual validation and loading state scenarios (integration/page focus; component demos live in `apps/ui-showcase`)
- Pluggable frontend state architecture via state contracts (interfaces + injectable presenters)

## Routes

- `/` - Protected home page showing user data
- `/register` - User registration form
- `/login` - User login form
- `/users/:username` - Protected public profile page (defaults to Timeline)
- `/users/:username/:section` - Protected public profile section route (`timeline|photos|about|friends|personal`)
- `/users/:username/photos` - Protected photos root route (redirects to `/users/:username/photos/unsorted`)
- `/users/:username/photos/unsorted` - Protected unsorted photos tab
- `/users/:username/photos/albums` - Protected albums tab
- `/users/:username/photos/albums/:albumId` - Protected album detail tab
- `/account` - Protected account settings root (redirects to `/account/personal-data`)
- `/account/personal-data` - Personal data settings section (default)
- `/account/privacy` - Privacy settings section (mock)
- `/account/security` - Security settings section (mock)
- `/account/notifications` - Notifications settings section (mock)
- `/account/configurations` - Configurations settings section (mock)
- `/account/help-support` - Help and support section (mock)
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
- Navbar account settings: `navbar-account-settings-link`
- UserProfile: `user-profile-card`, `user-profile-stats`, `user-profile-posts-list`
- UserProfile tabs: `user-profile-sections-tab-*`, `user-profile-photos-section`, `user-profile-about-section`, `user-profile-friends-section`, `user-profile-personal-section`
- UserProfile photo tabs: `user-profile-photos-tabs`, `user-profile-photos-tab-unsorted`, `user-profile-photos-tab-albums`, `user-profile-photos-unsorted-section`, `user-profile-photos-albums-section`, `user-profile-photos-album-detail-section`, `user-profile-photos-album-back-button`
- UserProfile avatar actions/modal: `user-profile-avatar-trigger`, `user-profile-avatar-actions-menu`, `user-profile-avatar-see-image-action`, `user-profile-avatar-change-image-action`, `user-profile-avatar-file-input`, `user-profile-avatar-upload-error`, `user-profile-avatar-modal`, `user-profile-avatar-modal-image`, `user-profile-avatar-modal-close-button`
- Account settings: `account-settings-page`, `account-settings-navigation`, `account-settings-nav-*`

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
  components/     - App-level reusable UI composition (shared primitives are in `@repo/ui`)
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
- UserProfile page uses `UserProfileStateContractProvider` + `useUserProfileStateContract()`
- Friends page uses `FriendsStateContractProvider` + `useFriendsStateContract()`
- Default presenter is `useHomeStatePresenter` under the hooks approach folder
- Default register presenter is `useRegisterStatePresenter` under the hooks approach folder
- Default login presenter is `useLoginStatePresenter` under the hooks approach folder
- Default my-posts presenter is `useMyPostsStatePresenter` under the hooks approach folder
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

Storybook in `apps/user-portal` now focuses on **integration/page-level validation** for this app.

Component-level demo stories are intentionally removed from user-portal and now live in `apps/ui-showcase`, while runtime shared components are consumed from `@repo/ui`.

- Config: `.storybook/main.ts` and `.storybook/preview.ts`
- Current integration stories include:
  - `src/stories/HomeLoadingScenarios.stories.tsx`
  - `src/stories/DesignSystem.stories.tsx`

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

## Design System

The portal uses a formal **design system** based on design tokens (CSS variables) and layout primitives to ensure consistency and responsive behavior across all pages.

### Design Tokens

Design tokens are CSS custom properties defined in `src/styles.css` and mapped into Tailwind via `tailwind.config.ts`. They serve as the single source of truth for spacing, colors, typography, and responsive breakpoints.

#### Spacing Scale

Spacing follows a 4px base unit:

```
--space-1: 4px    (0.25rem)
--space-2: 8px    (0.5rem)
--space-3: 12px   (0.75rem)
--space-4: 16px   (1rem)
--space-6: 24px   (1.5rem)
--space-8: 32px   (2rem)
--space-10: 40px  (2.5rem)
--space-12: 48px  (3rem)
--space-16: 64px  (4rem)
--space-20: 80px  (5rem)
```

Usage in Tailwind:

```tsx
<div className="p-4">Content</div>          {/* padding: 16px */}
<div className="gap-6">Stack with gap</div> {/* gap: 24px */}
<div className="mb-8">Margin bottom</div>   {/* margin-bottom: 32px */}
```

#### Color Tokens

Semantic color roles:

- **Background colors**: Primary (white), secondary (light gray), tertiary (medium gray), accent (light blue), danger (light red)
- **Text colors**: Primary (dark), secondary (medium gray), tertiary (light gray), inverse (white)
- **Accent colors**: Primary (blue), hover, and active shades
- **Utility colors**: Border, danger, and shadow colors

Example:

```tsx
<div className="bg-bg-primary text-text-primary">Styled with semantic tokens</div>
```

#### Typography Scale

Font sizes aligned with common UI patterns:

```
--type-xs: 12px
--type-sm: 14px
--type-base: 16px
--type-lg: 18px
--type-xl: 20px
--type-2xl: 24px
--type-3xl: 30px
```

Font weights and line heights also tokenized for accessible reading.

#### Border Radius & Shadows

- **Radius**: `sm` (6px, compact), `md` (8px, default), `lg` (12px, elevated), `xl` (16px, prominent)
- **Shadows**: `sm`, `md`, `lg`, `card` (predefined elevation levels)

#### Responsive Breakpoints

Mobile-first breakpoints (all values from CSS variables):

- `sm: 640px` — tablet portrait
- `md: 768px` — small desktop
- `lg: 1024px` — desktop
- `xl: 1280px` — large desktop

### Layout Primitives

**Layout primitives** are shared React components from `@repo/ui` that encapsulate responsive design patterns and use tokens consistently.

#### Container

Responsive full-width wrapper with max-width, centered padding, and mobile-first breakpoints.

```tsx
import { Container } from '@repo/ui';

<Container maxWidth="6xl" padding="px-4 py-10">
  <h1>My Page</h1>
  <p>Content centered and responsive</p>
</Container>;
```

**Props:**

- `maxWidth` - max-width constraint: `'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'` (default: `'6xl'`)
- `padding` - override spacing (default: `'px-4 py-10'`)
- `className` - additional tailwind utilities
- `dataTestId` - test identifier

#### Stack

Flexible container for stacking items vertically or horizontally with consistent gaps.

```tsx
import { Stack } from '@repo/ui';

{
  /* Vertical stack (default) */
}
<Stack gap="gap-6">
  <Header />
  <Content />
  <Footer />
</Stack>;

{
  /* Horizontal stack with center alignment */
}
<Stack direction="horizontal" gap="gap-8" align="center" justify="between">
  <Logo />
  <Nav />
  <UserMenu />
</Stack>;
```

**Props:**

- `direction` - `'vertical' | 'horizontal'` (default: `'vertical'`)
- `gap` - spacing between items: `'gap-1' | 'gap-2' | 'gap-3' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-10' | 'gap-12'` (default: `'gap-4'`)
- `align` - cross-axis alignment: `'start' | 'center' | 'end' | 'stretch'` (default: `'stretch'`)
- `justify` - main-axis alignment: `'start' | 'center' | 'end' | 'between' | 'around'` (default: `'start'`)
- `className` - additional tailwind utilities
- `dataTestId` - test identifier

#### Grid

Responsive multi-column layout with mobile-first breakpoints.

```tsx
import { Grid } from '@repo/ui';

{
  /* 1 column on mobile, 2 on tablet, 3 on desktop */
}
<Grid columns={{ default: 1, sm: 2, md: 3 }} gap="gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>;

{
  /* Feed layout: 1 column on mobile, 2 on large desktop */
}
<Grid columns={{ default: 1, lg: 2 }} gap="gap-8">
  <PostCard />
  <PostCard />
</Grid>;
```

**Props:**

- `columns` - responsive column config: `{ default?, sm?, md?, lg?, xl? }` (each is `1..12`)
- `gap` - spacing between items (default: `'gap-4'`)
- `className` - additional tailwind utilities
- `dataTestId` - test identifier

#### Section

Semantic grouping container with optional title, background, border, and padding. Renders as `<section>` element for proper document outline.

```tsx
import { Section } from '@repo/ui';

<Section title="Personal Information">
  <p>Your profile details go here.</p>
</Section>

<Section
  title="Recent Posts"
  subtitle="Your latest activity"
  background="accent"
  hasBorder
>
  <PostList />
</Section>

{/* Minimal section */}
<Section background="transparent" padding="p-4">
  Compact content area
</Section>
```

**Props:**

- `title` - optional h2 heading
- `subtitle` - optional description below title
- `background` - `'primary' | 'secondary' | 'accent' | 'danger' | 'transparent'` (default: `'primary'`)
- `hasBorder` - include border (default: `false`)
- `padding` - spacing inside (default: `'p-6'`)
- `className` - additional tailwind utilities
- `dataTestId` - test identifier

### Design System Governance

**New/Changed UI Compliance:**

- All new components or pages must use design primitives from `@repo/ui` for major layouts
- All new components must use design tokens for spacing, colors, and typography
- Existing pages/components use ad-hoc utilities during refactoring (no retrofit requirement)

**Monorepo UI Direction:**

- Runtime reusable UI components are planned for shared package(s) under `packages/`
- A dedicated UI showcase/docs app is planned under `apps/` for component demos
- user-portal keeps integration/page stories and product workflow validation
- Shared package components must be tested in the package itself; user-portal keeps integration/e2e coverage

**Responsive Pattern:**

Use mobile-first approach: base styles for mobile, then breakpoint utilities for larger screens.

```tsx
{
  /* Good: mobile-first responsiveness via layout primitives */
}
<Grid columns={{ default: 1, sm: 2, md: 3, lg: 4 }} />;

{
  /* Acceptable: using Tailwind breakpoint utilities directly */
}
<div className="p-4 sm:p-6 md:p-8">Content</div>;

{
  /* Avoid: mixing units and ad-hoc sizing */
}
<div style={{ padding: '16px', gap: '8px' }}>Not recommended</div>;
```

**Testing Stability:**

Component selectors (`data-testid`) remain stable across token/primitive updates. E2E tests depend on these selectors—ensure they're unaffected by style changes.

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
- Unified UserProfile avatar behavior: viewing your own profile opens a floating actions menu (`See image`, `Change image`), while viewing another profile opens avatar preview directly in a modal
- Like button uses optimistic updates: UI updates immediately, reverts on network error
- PostCard displays like count and "liked by me" status from reaction summary

## TODO

- [ ] Add own-profile management actions for album/photo CRUD and About/Personal editing in unified user profile (`/users/:username`)
