# Auth Service

Microservice for user authentication, JWT token generation, user profile management, and email verification. Communicates with API Gateway via TCP.

## Purpose

- Handle user registration with password hashing (bcrypt)
- Validate login credentials and issue JWT tokens
- Retrieve user profile information
- Manage email verification tokens (SHA-256 hashed, 24h TTL, single-use)
- Publish user registration events to RabbitMQ for event-driven workflows
- Store user data (in-memory for development)

## Architecture

```
API Gateway (HTTP)
  ↓ TCP Request
Auth Service (Port 4001)
  ├─→ UserRepository (in-memory storage)
  ├─→ EmailVerificationTokenRepository (in-memory storage)
  ├─→ RabbitMQ Event Publisher (user.registered events)
  └─→ JwtService (token generation)
```

## Commands

The service handles RPC messages from the API Gateway:

- `AUTH_COMMANDS.register` - User registration
  - Input: `{ name, username, email, password }`
  - Output: `{ id, username, email }`
  - Side effect: Creates a verification token, publishes `user.registered` event to RabbitMQ

- `AUTH_COMMANDS.login` - User authentication
  - Input: `{ email, password }`
  - Output: `{ id, email, accessToken }`
  - Process: Validates credentials, generates JWT token

- `AUTH_COMMANDS.getProfile` - Retrieve user profile
  - Input: `{ userId }`
  - Output: `{ id, name, username, email, emailVerifiedAt }`
  - Requires: User must exist

- `AUTH_COMMANDS.createEmailVerificationToken` - Create a new hashed token
  - Input: `{ userId }`
  - Output: `{ verificationToken, expiresAt }`

- `AUTH_COMMANDS.confirmEmailVerification` - Consume token and mark user as verified
  - Input: `{ token }` (raw token from email link)
  - Output: `{ status: 'verified' | 'already_verified', emailVerifiedAt }`
  - Idempotent: already-verified users return `already_verified` immediately

- `AUTH_COMMANDS.requestEmailVerification` - Resend verification email
  - Input: `{ userId }`
  - Output: `{ queued: boolean }`
  - No-op if user is already verified

## Use Cases

### RegisterUseCase

1. Check if email already exists (returns ConflictException if true)
2. Check if username already exists (returns ConflictException if true)
3. Normalize username on write (`trim` + lowercase)
4. Validate username policy (length, allowed characters, reserved names)
5. Hash password using bcrypt
6. Create user in UserRepository
7. Create a SHA-256-hashed verification token (24h TTL) via `CreateEmailVerificationTokenUseCase`
8. Publish `USER_EVENTS.REGISTERED` event to RabbitMQ (includes raw token for the email link)
9. Return user id, username, and email

### LoginUseCase

1. Find user by email
2. Compare provided password with stored hash
3. Generate JWT token with `{ sub: userId, email }`
4. Return user id, email, and access token

### GetProfileUseCase

1. Find user by userId
2. Return id, name, username, email, and emailVerifiedAt (ISO string or null)
3. Throw NotFoundException if user not found

### CreateEmailVerificationTokenUseCase

1. Generate a cryptographically-random 32-byte token
2. Store a SHA-256 hash of the token with 24h TTL
3. Return the raw token (only ever sent via email) and expiry date

### ConfirmEmailVerificationUseCase

1. Hash the received token (SHA-256), find in repository
2. Guard: not found → 400, already consumed → 400, expired → 400
3. If user already verified → return `already_verified` immediately (idempotent)
4. Consume token and mark user's `emailVerifiedAt`

### RequestEmailVerificationUseCase

1. Find user; guard: not found → 404, already verified → `{ queued: false }`
2. Create a new verification token
3. Emit `user.emailVerificationRequested` event so event-handler sends a fresh email
4. Return `{ queued: true }`

## Event Publishing

On successful registration or resend request, events are published to RabbitMQ:

```
User Registration Event
├─ Exchange: "social-media.events" (topic type)
├─ Routing Key: "user.registered"
├─ Event Payload: { userId, name, email, createdAt, verificationToken, tokenExpiresAt }
└─ Consumer: event-handler-service processes the event and sends verification email

Verification Email Requested Event
├─ Exchange: "social-media.events" (topic type)
├─ Routing Key: "user.emailVerificationRequested"
├─ Event Payload: { userId, name, email, requestedAt, verificationToken, tokenExpiresAt }
└─ Consumer: event-handler-service processes the event and sends verification email
```

## Configuration

Environment variables (see `.env.example`):

```env
PORT=4001
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_EXCHANGE=social-media.events
```

## Storage

Currently uses **in-memory storage** for development:

- Seeded users are pre-marked with `emailVerifiedAt` so existing E2E flows work without manual verification
- Usernames are stored with a canonical value (`usernameCanonical`) for consistent uniqueness checks
- Reserved usernames are blocked (e.g., `admin`, `support`, `root`, `system`)
- Data persists only during service runtime
- Ready for PostgreSQL integration (add a unique index/constraint on `username_canonical` during migration)

## Testing

Run the test suite:

```sh
pnpm --filter auth-service test
```

Tests cover:

- RegisterUseCase (happy path, email already exists, password hashing, token creation)
- LoginUseCase (valid credentials, user not found, wrong password, JWT signing)
- GetProfileUseCase (user found with/without emailVerifiedAt, user not found)
- User entity creation and validation (including emailVerifiedAt)

## Running

Development:

```sh
pnpm --filter auth-service dev
```

From root:

```sh
pnpm dev
```

Then test with curl:

```sh
# Register
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","username":"johndoe","email":"john@example.com","password":"secret"}'

# Login
curl -X POST http://localhost:4000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret"}'

# Get profile (with token from login)
curl -X GET http://localhost:4000/users/me \
  -H "Authorization: Bearer {accessToken}"

# Confirm email verification (token from email link)
curl -X POST http://localhost:4000/users/email-verification/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"raw-token-from-email"}'

# Resend verification email (requires auth)
curl -X POST http://localhost:4000/users/email-verification/request \
  -H "Authorization: Bearer {accessToken}"
```

## Tech Stack

- **NestJS** - Framework
- **@nestjs/jwt** - JWT token handling
- **@nestjs/passport** - Authentication strategy support
- **bcrypt** - Password hashing
- **amqplib** - RabbitMQ client
- **Jest** - Testing framework
- **Pino** - Structured logging

## Error Handling

The service throws NestJS exceptions that are serialized over TCP:

- `ConflictException` - Email already registered or username already taken (409)
- `UnauthorizedException` - Invalid credentials (401)
- `NotFoundException` - User not found (404)
- `BadRequestException` - Invalid/expired/consumed token (400)

These are caught by the API Gateway's exception filter and converted to HTTP responses.
