# Auth Service

Microservice for user authentication, JWT token generation, and user profile management. Communicates with API Gateway via TCP.

## Purpose

- Handle user registration with password hashing (bcrypt)
- Validate login credentials and issue JWT tokens
- Retrieve user profile information
- Publish user registration events to RabbitMQ for event-driven workflows
- Store user data (in-memory for development)

## Architecture

```
API Gateway (HTTP)
  ↓ TCP Request
Auth Service (Port 4001)
  ├─→ UserRepository (in-memory storage)
  ├─→ RabbitMQ Event Publisher (user.registered events)
  └─→ JwtService (token generation)
```

## Commands

The service handles RPC messages from the API Gateway:

- `AUTH_COMMANDS.register` - User registration
  - Input: `{ name, email, password }`
  - Output: `{ id, email }`
  - Side effect: Publishes `user.registered` event to RabbitMQ

- `AUTH_COMMANDS.login` - User authentication
  - Input: `{ email, password }`
  - Output: `{ id, email, accessToken }`
  - Process: Validates credentials, generates JWT token

- `AUTH_COMMANDS.getProfile` - Retrieve user profile
  - Input: `{ userId }`
  - Output: `{ id, name, email }`
  - Requires: User must exist

## Use Cases

### RegisterUseCase

1. Check if email already exists (returns ConflictException if true)
2. Hash password using bcrypt
3. Create user in UserRepository
4. Publish `USER_EVENTS.REGISTERED` event to RabbitMQ
5. Return user id and email

### LoginUseCase

1. Find user by email
2. Compare provided password with stored hash
3. Generate JWT token with `{ sub: userId, email }`
4. Return user id, email, and access token

### GetProfileUseCase

1. Find user by userId
2. Return id, name, and email
3. Throw NotFoundException if user not found

## Event Publishing

On successful registration, an event is published to RabbitMQ:

```
User Registration Event
├─ Exchange: "social-media.events" (topic type)
├─ Routing Key: "user.registered"
├─ Event Payload: { userId, name, email, createdAt }
└─ Consumer: event-handler-service processes the event
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

- Seeded with 0 users on startup
- Data persists only during service runtime
- Ready for PostgreSQL integration

## Testing

Run the test suite:

```sh
pnpm --filter auth-service test
```

Tests cover:

- RegisterUseCase (happy path, email already exists, password hashing)
- LoginUseCase (valid credentials, user not found, wrong password, JWT signing)
- GetProfileUseCase (user found, user not found)
- User entity creation and validation

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
  -d '{"name":"John Doe","email":"john@example.com","password":"secret"}'

# Login
curl -X POST http://localhost:4000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret"}'

# Get profile (with token from login)
curl -X GET http://localhost:4000/users/me \
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

- `ConflictException` - Email already registered (409)
- `UnauthorizedException` - Invalid credentials (401)
- `NotFoundException` - User not found (404)
- `BadRequestException` - Invalid input (400)

These are caught by the API Gateway's exception filter and converted to HTTP responses.
