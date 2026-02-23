# Posts Service

Microservice for managing posts (CRUD operations).

## Tech Stack

- NestJS
- TCP Transport (Port 4001)
- In-memory storage

## Features

- Create posts
- Get posts by ID
- Correlation ID tracking
- Structured logging with Pino

## Running

```sh
pnpm dev
```

## Endpoints (via API Gateway)

- `POST /posts` - Create a new post (requires JWT)
- `GET /posts/:id` - Get a post by ID
