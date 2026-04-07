# Friendship Service

TCP microservice responsible for friendship requests and relationships.

## Responsibilities

- Send friend requests
- Accept / reject pending requests
- List authenticated user's friends
- List incoming and outgoing pending requests
- Resolve friendship status between two users

## Port

- Default TCP port: `4005`

## Configuration

Environment variables (see `.env.example`):

```env
PORT=4005
LOGS_TO_LOKI=true
LOKI_HOST=http://localhost
LOKI_PORT=3100
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0
```

## Notes

- Uses in-memory repository for now
- API Gateway handles authentication and forwards actor `userId`
- Feed behavior is unchanged by friendships at this stage
- Sentry captures runtime errors when `SENTRY_DSN` is configured

## Seeded data (in-memory)

For local manual testing and E2E coverage, the repository boots with a small social graph:

- `alice` (id `1`) has an accepted friendship with `bob` (id `2`)
- `alice` has an incoming pending request from `charlie` (id `3`)
- `alice` has an outgoing pending request to `diana` (id `4`)
- Additional relationships also exist for non-alice users
