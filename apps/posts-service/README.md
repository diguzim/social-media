# Posts Service

Microservice for managing user posts with full CRUD operations. Communicates with API Gateway via TCP.

## Purpose

- Create, read, update, and delete posts
- List posts with pagination, filtering, and sorting
- Verify post ownership before allowing modifications
- Store post data (in-memory for development)
- Request correlation tracking and structured logging

## Architecture

```
API Gateway (HTTP)
  ↓ TCP Request
Posts Service (Port 4002)
  └─→ PostRepository (in-memory storage)
       └─ Seeded with 22 sample posts
```

## Commands

The service handles RPC messages from the API Gateway:

- `POST_COMMANDS.createPost` - Create a new post
  - Input: `{ title, content, authorId }`
  - Output: `{ id, title, content, authorId, createdAt }`
  - Requires: authorId must be a valid user ID

- `POST_COMMANDS.getPost` - Retrieve a specific post
  - Input: `{ postId }`
  - Output: `{ id, title, content, authorId, createdAt }`

- `POST_COMMANDS.getPosts` - List posts with pagination/filtering
  - Input: `{ page, limit, authorId?, sortBy, sortOrder }`
  - Output: `{ data: [posts], total, page, limit }`
  - Supports: Pagination, author filtering, sorting

- `POST_COMMANDS.updatePost` - Update a post
  - Input: `{ postId, authorId, title?, content? }`
  - Output: `{ id, title, content, authorId, createdAt }`
  - Requires: authorId must match post owner
  - Throws: ForbiddenException if not the author

- `POST_COMMANDS.deletePost` - Delete a post
  - Input: `{ postId, authorId }`
  - Output: `{ id }`
  - Requires: authorId must match post owner
  - Throws: ForbiddenException if not the author

- `REACTION_COMMANDS.toggleReaction` - Like/unlike a post
  - Input: `{ userId, targetId, targetType: 'post', reactionType: 'like' }`
  - Output: `{ reactionId?, targetId, targetType, reactionType, isAdded }`
  - Behavior: Toggle (create if missing, delete if exists)
  - Returns: `isAdded: true` if created, `false` if deleted

- `REACTION_COMMANDS.getReactionSummaryBatch` - Get reaction stats for posts
  - Input: `{ targetIds: [postIds], targetType: 'post', userId? }`
  - Output: `{ summaries: [{ targetId, reactionType, count, reactedByCurrentUser? }] }`
  - Returns: Like counts and user's like status for multiple posts (N+1 prevention)

- `COMMENT_COMMANDS.createComment` - Create a comment in a post
  - Input: `{ postId, authorId, content }`
  - Output: `{ id, postId, authorId, content, createdAt, updatedAt? }`

- `COMMENT_COMMANDS.getComments` - List comments for a post
  - Input: `{ postId, page?, limit?, sortOrder? }`
  - Output: `{ data: [comments], total, page, limit, totalPages }`

- `COMMENT_COMMANDS.updateComment` - Update a comment
  - Input: `{ postId, commentId, authorId, content }`
  - Output: `{ id, postId, authorId, content, createdAt, updatedAt? }`
  - Requires: authorId must match comment owner

- `COMMENT_COMMANDS.deleteComment` - Delete a comment
  - Input: `{ postId, commentId, authorId }`
  - Output: `{ success: true }`
  - Requires: authorId must match comment owner
## Use Cases

### CreatePostUseCase

1. Validate title and content are provided
2. Create post with provided data
3. Return post details with creation timestamp

### GetPostUseCase

1. Find post by ID
2. Return post details or throw NotFoundException

### GetPostsUseCase

1. Retrieve all posts from repository
2. Apply optional author filter
3. Apply pagination (page, limit)
4. Apply sorting (sortBy, sortOrder)
5. Return paginated results with total count

### UpdatePostUseCase

1. Find post by ID (throw NotFoundException if not found)
2. Verify authorId matches post owner (throw ForbiddenException if not)
3. Update title and/or content
4. Return updated post

### DeletePostUseCase

1. Find post by ID (throw NotFoundException if not found)
2. Verify authorId matches post owner (throw ForbiddenException if not)
3. Delete post
4. Return deleted post ID

### ToggleReactionUseCase

1. Check if user already reacted with this reactionType to this post
2. If yes, delete the existing reaction and return `isAdded: false`
3. If no, create new reaction and return `isAdded: true`
4. Idempotent: consecutive calls safely toggle like on/off

### GetReactionSummaryBatchUseCase

1. Accept array of post IDs to summarize
2. Count likes for each post
3. If userId provided, mark which posts this user liked
4. Return summary array with reaction counts and user status
5. Allows feed to show like counts and "likedByMe" flag without N+1 queries

## Query Parameters

When listing posts via `GET /posts`:

```
?page=1               # Page number (default: 1)
&limit=10            # Posts per page (default: 10)
&authorId=user-123   # Filter by author (optional)
&sortBy=createdAt    # Sort field: createdAt or title (default: createdAt)
&sortOrder=desc      # Sort order: asc or desc (default: desc)
```

Logging environment variables:

```env
LOGS_TO_LOKI=true
LOKI_HOST=http://localhost
LOKI_PORT=3100
```

Example:

```
GET /posts?page=2&limit=5&authorId=user-1&sortBy=createdAt&sortOrder=asc
```

## Data Model

Post entity:

```typescript
{
  id: string; // Unique ID
  title: string; // Post title
  content: string; // Post content
  authorId: string; // User ID of post creator
  createdAt: Date; // Creation timestamp
}
```

## Storage

Currently uses **in-memory storage** for development:

- Seeded with 22 sample posts on startup
- Each post has a unique incrementing ID
- Data persists only during service runtime
- Ready for PostgreSQL integration

## Testing

Run the test suite:

```sh
pnpm --filter posts-service test
```

Tests cover:

- CreatePostUseCase (happy path, invalid input)
- GetPostUseCase (post exists, not found)
- GetPostsUseCase (pagination, filtering, sorting)
- UpdatePostUseCase (authorized update, forbidden, not found)
- DeletePostUseCase (authorized delete, forbidden, not found)

## Running

Development:

```sh
pnpm --filter posts-service dev
```

From root:

```sh
pnpm dev
```

Then test with curl (requires JWT token):

```sh
# Create a post (with valid JWT from login)
curl -X POST http://localhost:4000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"title":"My Post","content":"Hello world"}'

# List posts with pagination
curl http://localhost:4000/posts?page=1&limit=5

# Get a specific post
curl http://localhost:4000/posts/1

# Update a post (owner only)
curl -X PATCH http://localhost:4000/posts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"title":"Updated Title"}'

# Delete a post (owner only)
curl -X DELETE http://localhost:4000/posts/1 \
  -H "Authorization: Bearer {token}"
```

## Features

- **Pagination**: Full support with page and limit parameters
- **Filtering**: Filter by author ID
- **Sorting**: Sort by creation date or title in ascending/descending order
- **Ownership Verification**: Only post authors can edit or delete
- **Comment Ownership Verification**: Only comment authors can edit or delete comments
- **Correlation Tracking**: Request correlation IDs for tracing
- **Structured Logging**: Pino logger with request context

## Tech Stack

- **NestJS** - Framework
- **@nestjs/microservices** - TCP transport
- **Jest** - Testing framework
- **Pino** - Structured logging
- **TypeScript** - Type safety

## Error Handling

The service throws NestJS exceptions that are serialized over TCP:

- `NotFoundException` - Post or author not found (404)
- `ForbiddenException` - Not authorized to modify post (403)
- `BadRequestException` - Invalid input (400)
