# E2E Tests

End-to-end tests for the social media platform using Cypress. Tests the complete user journey across the UI and backend microservices.

## Purpose

- Test critical user flows: registration, login, profile view
- Verify all services work together (frontend → API gateway → microservices)
- Ensure data persistence (JWT tokens, user profiles)
- Catch integration issues early

## Test Structure

```
cypress/
  component/
    feed/
      Feed.cy.tsx        # Feed component tests (network mocked)
  e2e/
    auth/
      register.cy.ts      # User registration flow
      login.cy.ts         # User login flow
      home.cy.ts          # Home page and profile/feed view
      verify-email.cy.ts  # Email verification page flow
    photos/
      photos.cy.ts        # Albums + unsorted photos on own/public profile routes
    posts/
      feed.cy.ts          # Feed API enrichment and pagination checks
      create-post.cy.ts   # Create post UI flow on Home/My Posts
      manage-post.cy.ts   # Edit title/content, image manage, delete flow
      reactions.cy.ts     # Post like toggle API behavior
      comments.cy.ts      # Post comments CRUD on Home and My Posts
  support/
    commands.ts           # Custom Cypress commands
    e2e.ts               # Global hooks and setup
cypress.config.ts         # Cypress configuration
```

## Custom Commands

The `cypress/support/commands.ts` file provides helper commands:

- `cy.visitHome()` - Navigate to home page and verify
- `cy.visitRegister()` - Navigate to register page
- `cy.visitLogin()` - Navigate to login page
- `cy.registerUser(user)` - Fill and submit registration form
- `cy.loginUser(email, password)` - Fill and submit login form
- `cy.registerAndLogin(user)` - Register and login in one command
- `cy.authenticateViaApi(overrides?)` - Register+login via API and bootstrap localStorage for protected-route specs

## Configuration

Cypress config in `cypress.config.ts`:

- **Base URL**: `http://localhost:3000` (frontend)
- **API Base URL**: `http://localhost:4000` (api-gateway)
- **Spec Pattern**: `cypress/e2e/**/*.cy.ts`
- **Timeouts**: 5s for commands, 30s for page load
- **Support File**: `cypress/support/e2e.ts`

## Running Tests

### Quick Start

**Terminal 1**: Start all services

```sh
cd /path/to/social-media
pnpm dev
```

**Terminal 2**: Run tests

```sh
cd apps/e2e

# Interactive mode (RECOMMENDED: use Electron to avoid Chrome issues)
pnpm open:electron

# OR run all tests headless
pnpm test

# OR run with visible browser
pnpm test:electron
```

### Open Cypress Test Runner (interactive)

```sh
pnpm open          # Opens with default browser (Chrome)
# OR
pnpm open:electron # Opens with Electron (RECOMMENDED - more stable)
```

Opens the Cypress UI where you can:

- Select and run individual tests
- See real-time test execution
- Inspect elements and network requests
- Debug failures

**Note**: If you experience Chrome crashes (IPC error 114), use `pnpm open:electron` instead.

### Run All Tests (headless)

```sh
pnpm test
```

Runs all specs in headless mode and exits.

### Run with Browser (debug)

```sh
pnpm test:debug
```

Runs tests with the browser visible for debugging.

### CI Mode

```sh
pnpm ci
```

Optimized for CI/CD environments (headless, optimized output).

### Using the E2E Runner Script

      home.cy.ts          # Home page and profile view

A convenience script `run-e2e.sh` is available to handle startup:

```sh
# Make it executable
chmod +x run-e2e.sh

# Run with Cypress UI
./run-e2e.sh open


- `cy.getByTestId(testId)` - Query elements using `data-testid`
# Run with visible browser
./run-e2e.sh debug

./run-e2e.sh
```

## Selector Strategy (`data-testid`)

All E2E selectors should use `data-testid` attributes for stability.

- ✅ Prefer: `cy.getByTestId("login-submit-button")`
- ❌ Avoid for interaction: `cy.contains("button", "Login")`

Use text assertions only when text itself is the behavior under test.

Example:

```typescript
cy.getByTestId("login-email-input").type("user@example.com");
cy.getByTestId("login-password-input").type("Secret123!");
cy.getByTestId("login-submit-button").click();
cy.getByTestId("home-welcome-title").should("contain.text", "Welcome");
```

This script:

1. Starts all services (pnpm dev)
2. Waits for frontend to be ready
3. Runs Cypress tests
4. Cleans up services when done

## Test Isolation

Each test:

- Clears localStorage before running (clean state)
- Creates a unique test user via faker-based factories (`buildTestUser`)
- Performs actual API calls to the backend

### Programmatic Auth Strategy

- For **protected feature specs** (e.g. home/profile/feed), tests use `cy.authenticateViaApi()` in `beforeEach`.
- This creates a fresh fake E2E user via API, logs in via API, fetches `/users/me`, and sets `jwtToken` + `user` in localStorage before app boot.
- For **auth flow specs** (`register.cy.ts`, `login.cy.ts`), keep using real UI interactions to validate forms and navigation behavior.

## Test Data Generation

E2E specs use synthetic test data generation via `@faker-js/faker`.

- Helper file: [cypress/support/test-data.ts](cypress/support/test-data.ts)
- Primary factory: `buildTestUser()`
- Purpose: generate random, realistic names/emails and avoid collisions in repeated runs
- Registration payloads include `{ name, username, email, password }`

## Writing New Tests

Follow the pattern in existing `.cy.ts` files:

```typescript
describe("Feature Name", () => {
  beforeEach(() => {
    // Setup (navigate, create test data)
  });

  it("should do something", () => {
    // Arrange, Act, Assert
    cy.visit("/page");
    cy.get("button").click();
    cy.screen("h1").should("contain", "Expected Text");
  });
});
```

## Test Coverage

Currently covers:

### Auth

- **Register**: Navigation, form submission, validation, redirect
- **Login**: Valid/invalid credentials, redirect, token storage
- **Home**: Profile fetch, data display, logout, navigation
- **Verify Email**: Token confirmation call, single-request guard, missing-token error state

### Posts

- **Feed**: Enriched author data, pagination, and filter behavior
- **Create Post**: Form validation, submit UX, and visibility in Home/My Posts
- **Manage Post**: Edit title/content, add/remove/reorder images, and delete own post
- **Reactions**: Toggle like flow and feed reaction summaries
- **Comments**: Create/edit/delete own comments and ownership restrictions across Home/My Posts

### Photos

- **Photos/Albums**: Create/update/delete album, upload photos, verify album delete behavior, and verify public profile photos rendering

## Best Practices

1. **Use custom commands** - Keep tests DRY with `cy.registerUser()` etc
2. **Unique test data** - Use faker-generated names/emails via `buildTestUser()`
3. **Wait for elements** - Cypress waits by default, but be explicit on slow operations
4. **Avoid hard sleeps** - Use `cy.contains()`, `cy.get()` which retry
5. **Test user journeys** - Don't test implementation, test user behavior
6. **Check both UI and data** - Verify visual changes AND localStorage/API calls

## Dependencies

To run tests, you need:

1. **All services running**: `pnpm dev` (or individually)
   - `pnpm --filter user-portal dev`
   - `pnpm --filter api-gateway dev`
   - `pnpm --filter auth-service dev`

2. **Cypress installed**: Already in `package.json`

## Troubleshooting

### Chrome crashes with "bad IPC message, reason 114"

This is a known Chrome/Chromium issue on some systems. **Solutions**:

**Option 1 (RECOMMENDED)**: Use Electron browser

```sh
pnpm open:electron  # Opens Cypress with Electron
# OR
pnpm test:electron  # Runs tests with visible Electron browser
```

**Option 2**: Run headless (no browser UI)

```sh
pnpm test  # Runs all tests without opening browser
```

**Option 3**: Clear Cypress cache

```sh
npx cypress cache clear
pnpm install --force
pnpm open:electron
```

### Tests timeout waiting for page

- Increase `defaultCommandTimeout` in `cypress.config.ts`
- Check that frontend is running on port 3000
- Check that API Gateway is running on port 4000

### "Cannot find element" errors

- Check if element exists using Cypress DevTools
- May need to wait for async operations (profile fetch)
- Use `cy.contains()` instead of `cy.get()` for text-based selectors

### Test data persists across tests

- Tests should clear localStorage before each test (handled in `e2e.ts`)
- Register using unique emails with `Date.now()`
- Don't rely on specific user IDs

## CI/CD Integration

To run in CI/CD (GitHub Actions, etc):

```yaml
- name: Run E2E Tests
  run: |
    pnpm install
    pnpm dev &  # Start services in background
    sleep 10    # Wait for services to be ready
    pnpm --filter e2e ci
```

## Resources

- [Cypress Docs](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)
