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
  ├─→ Posts Service (TCP Port 4002) [create, read, update, delete posts]
  └─→ Image Service (TCP Port 4004) [profile avatar upload + lookup]
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
  - Returns: `{ id, name, username, email, emailVerifiedAt, avatarUrl? }`
  - Guards: **JwtAuthGuard** (requires valid JWT)

- `POST /users/avatar` - Upload current user's profile avatar
  - Content-Type: `multipart/form-data` with `file` field
  - Headers: `Authorization: Bearer {token}`
  - Validation: JPG/PNG only, max 2MB
  - Returns: `{ imageUrl, uploadedAt }`

- `GET /users/:userId/avatar` - Retrieve profile avatar image bytes
  - Returns: image stream with proper `Content-Type`

### Posts

- `POST /posts` - Create a new post
  - Body: `{ title, content }`
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ id, title, content, authorId, createdAt }`
  - Guards: **JwtAuthGuard**

- `GET /posts` - List all posts with pagination and filtering
  - Query params: `?page=1&limit=10&authorId=user-1&sortOrder=desc`
  - Returns: `{ data: [posts], total, page, limit, totalPages }`

- `GET /posts/feed` - Get author-enriched feed with reaction summary from current user perspective
  - Query params: `?page=1&limit=10&authorId=user-1&sortOrder=desc`
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard**
  - Returns: `{ data: [feedPosts], total, page, limit, totalPages }`

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

- `POST /posts/:id/comments` - Create a comment in a post
  - Body: `{ content }`
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard**
  - Returns: `{ id, postId, authorId, content, createdAt, updatedAt? }`

- `GET /posts/:id/comments` - List comments for a post
  - Query params: `?page=1&limit=20&sortOrder=asc`
  - Returns: `{ data: [comments], total, page, limit, totalPages }`

- `PATCH /posts/:postId/comments/:commentId` - Update own comment
  - Body: `{ content }`
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard** + ownership verification
  - Returns: `{ id, postId, authorId, content, createdAt, updatedAt? }`

- `DELETE /posts/:postId/comments/:commentId` - Delete own comment
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

IMAGE_SERVICE_HOST=localhost
IMAGE_SERVICE_PORT=4004

LOGS_TO_LOKI=true
LOKI_HOST=http://localhost
LOKI_PORT=3100
```

## Features

- **CORS**: Enabled for `http://localhost:3000` (frontend)
- **JWT Authentication**: Authorization header validation via JwtAuthGuard
- **Request Validation**: Global `ValidationPipe` with DTO classes on users endpoints (`whitelist`, `forbidNonWhitelisted`, `forbidUnknownValues`)
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
