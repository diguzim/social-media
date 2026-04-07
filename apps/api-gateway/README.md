# API Gateway

HTTP entrypoint for the social media platform. Routes HTTP requests from clients to backend microservices over TCP and returns responses.

## Purpose

- Single entry point for frontend clients
- CORS enabled for cross-origin requests from React SPA
- JWT verification for protected endpoints
- Request routing to auth-service, posts-service, image-service, and friendship-service microservices
- Translation layer between `API` (public HTTP) and `RPC` (internal TCP) contracts
- Exception serialization and HTTP response mapping

## Architecture

```
Client (Browser)
  ↓ HTTP
API Gateway (Port 4000)
  ├─→ Auth Service (TCP Port 4001)  [register, login, getProfile]
  ├─→ Posts Service (TCP Port 4002) [create, read, update, delete posts]
  ├─→ Image Service (TCP Port 4004) [profile avatar + post image upload/lookup]
  └─→ Friendship Service (TCP Port 4005) [friend requests + relationship status]
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

- `GET /users/:username/profile` - Get public user profile by username
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ id, name, username, emailVerifiedAt, avatarUrl? }`
  - Guards: **JwtAuthGuard** (requires valid JWT)

- `POST /users/avatar` - Upload current user's profile avatar
  - Content-Type: `multipart/form-data` with `file` field
  - Headers: `Authorization: Bearer {token}`
  - Validation: JPG/PNG only, max 2MB
  - Returns: `{ imageUrl, uploadedAt }`

- `GET /users/:userId/avatar` - Retrieve profile avatar image bytes
  - Returns: image stream with proper `Content-Type`
  - Implementation note: gateway streams bytes returned by image-service RPC (no shared filesystem path dependency)

- `POST /users/email-verification/confirm` - Confirm email using verification token
  - Body: `{ token }`
  - Returns: `{ status, emailVerifiedAt? }`

- `POST /users/email-verification/request` - Request verification email resend
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard**
  - Returns: `{ message }`

### Photos & Albums

- `GET /users/:username/photos` - Get user's albums and unsorted photos
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard**
  - Returns: `{ albums, unsortedPhotos }`

- `POST /users/me/albums` - Create album for current user
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ name, description? }`
  - Guards: **JwtAuthGuard**
  - Returns: `{ album }`

- `PATCH /users/me/albums/:albumId` - Update current user's album
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ name?, description?, coverPhotoId? }`
  - Guards: **JwtAuthGuard**
  - Returns: `{ album }`

- `DELETE /users/me/albums/:albumId` - Delete current user's album
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard**
  - Returns: `{ success: true }`

- `POST /users/me/photos` - Upload photo for current user
  - Content-Type: `multipart/form-data` with `file`, optional `albumId`, optional `description`
  - Headers: `Authorization: Bearer {token}`
  - Validation: JPG/PNG/GIF only, max 10MB
  - Guards: **JwtAuthGuard**
  - Returns: `{ photo }`

- `DELETE /users/me/photos/:photoId` - Delete current user's photo
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard**
  - Returns: `{ success: true }`

- `GET /users/:userId/photos/:photoId` - Retrieve user photo bytes
  - Returns: image stream with proper `Content-Type`

### Friends

- `POST /friends/requests` - Send friend request
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ targetUsername }`
  - Returns: `{ request }`

- `POST /friends/requests/:requestId/accept` - Accept pending request
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ request }`

- `POST /friends/requests/:requestId/reject` - Reject pending request
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ request }`

- `GET /friends` - List accepted friends of current user
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ data: FriendUserSummary[] }`

- `GET /friends/requests/incoming` - List incoming pending requests
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ data: FriendRequestItem[] }`

- `GET /friends/requests/outgoing` - List outgoing pending requests
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ data: FriendRequestItem[] }`

- `GET /friends/status/:username` - Relationship status with a user
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends' }`

- `GET /friends/count/:username` - Confirmed friends count for a user profile
  - Headers: `Authorization: Bearer {token}`
  - Returns: `{ count: number }`

### Posts

- `POST /posts` - Create a new post
  - Content-Type: `multipart/form-data` with `title`, `content`, optional `images[]`
  - Headers: `Authorization: Bearer {token}`
  - Validation: up to 10 images, JPG/PNG/GIF, max 10MB each
  - Returns: `{ id, title, content, authorId, createdAt, images[] }`
  - Guards: **JwtAuthGuard**

- `GET /posts/feed` - Get author-enriched feed (id, name, optional avatarUrl) with reaction summary from current user perspective
  - Query params: `?page=1&limit=10&authorId=user-1&sortOrder=desc`
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard**
  - Returns: `{ data: [feedPosts], total, page, limit, totalPages }`

- `GET /posts/:id` - Get a specific post
  - Returns: `{ id, title, content, authorId, createdAt, images[] }`

- `PATCH /posts/:id` - Update a post
  - Body: `{ title?, content? }`
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard** + ownership verification
  - Returns: `{ id, title, content, authorId, createdAt, images[] }`

- `POST /posts/:id/images` - Add images incrementally to an existing post
  - Content-Type: `multipart/form-data` with `images[]`
  - Headers: `Authorization: Bearer {token}`
  - Validation: total images per post cannot exceed 10, JPG/PNG/GIF, max 10MB each
  - Guards: **JwtAuthGuard** + ownership verification
  - Returns: updated post payload with `images[]`

- `DELETE /posts/:id/images/:imageId` - Remove a post image
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard** + ownership verification
  - Returns: updated post payload with `images[]`

- `PATCH /posts/:id/images/reorder` - Reorder post images
  - Body: `{ imageOrder: string[] }`
  - Headers: `Authorization: Bearer {token}`
  - Guards: **JwtAuthGuard** + ownership verification
  - Returns: updated post payload with reordered `images[]`

- `GET /posts/:postId/images/:imageId` - Retrieve post image bytes
  - Returns: image stream with proper `Content-Type`

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

FRIENDSHIP_SERVICE_HOST=localhost
FRIENDSHIP_SERVICE_PORT=4005

LOGS_TO_LOKI=true
LOKI_HOST=http://localhost
LOKI_PORT=3100
```

## Features

- **CORS**: Enabled for `http://localhost:3000` (frontend)
- **JWT Authentication**: Authorization header validation via JwtAuthGuard (24h expiration)
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
