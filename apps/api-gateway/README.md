# API Gateway

HTTP entrypoint for the social media platform. Routes HTTP requests from clients to backend microservices over TCP and returns responses.

## Purpose

- Single entry point for frontend clients
- CORS enabled for cross-origin requests from React SPA
- JWT verification for protected endpoints
- Request routing to auth-service and posts-service microservices
- Translation layer between `API` (public HTTP) and `RPC` (internal TCP) contracts
- Exception serialization and HTTP response mapping

## Architecture

```
Client (Browser)
  ↓ HTTP
API Gateway (Port 4000)
  ├─→ Auth Service (TCP Port 4001)  [register, login, getProfile]
  └─→ Posts Service (TCP Port 4002) [create, read, update, delete posts]
```

## Endpoints

### Authentication

- `POST /users` - Register new user
  - Body: `{ name, username, email, password }`
  - Returns: `{ id, name, username, email }`

- `POST /users/login` - Login with credentials
  - Body: `{ email, password }` where `email` accepts either email or username
  - Returns: `{ id, email, accessToken }`

- `GET /users/me` - Get current user profile
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ id, name, username, email, emailVerifiedAt }`
  - Guards: **JwtAuthGuard** (requires valid JWT)

### Posts

- `POST /posts` - Create a new post
  - Body: `{ title, content }`
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ id, title, content, authorId, createdAt }`
  - Guards: **JwtAuthGuard**

- `GET /posts` - List all posts with pagination and filtering
  - Query params: `?page=1&limit=10&authorId=user-1&sortOrder=desc`
  - Returns: `{ data: [posts], total, page, limit, totalPages }`

- `GET /posts/:id` - Get a specific post
  - Returns: `{ id, title, content, authorId, createdAt }`

- `PATCH /posts/:id` - Update a post
  - Body: `{ title?, content? }`
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard** + ownership verification
  - Returns: `{ id, title, content, authorId, createdAt }`

- `DELETE /posts/:id` - Delete a post
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard** + ownership verification
  - Returns: `{ success: true }`

## Configuration

Environment variables (see `.env.example`):

```env
PORT=4000
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

AUTH_SERVICE_HOST=localhost
AUTH_SERVICE_PORT=4001

POSTS_SERVICE_HOST=localhost
POSTS_SERVICE_PORT=4002
```

## Features

- **CORS**: Enabled for `http://localhost:3000` (frontend)
- **JWT Authentication**: Authorization header validation via JwtAuthGuard
- **Exception Handling**: AllExceptionsFilter for serializing microservice errors
- **Request Logging**: Correlation ID tracking and request duration
- **RPC Routing**: @nestjs/microservices ClientProxy pattern

## Running

Development:

```sh
pnpm dev
```

From root:

```sh
pnpm --filter api-gateway dev
```

## Tech Stack

- **NestJS** - Framework
- **@nestjs/microservices** - TCP transport for microservice communication
- **@nestjs/jwt** - JWT handling
- **@nestjs/passport** - Authentication strategy
- **Pino** - Structured logging
