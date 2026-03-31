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

## Notes

- Uses in-memory repository for now
- API Gateway handles authentication and forwards actor `userId`
- Feed behavior is unchanged by friendships at this stage

## Seeded data (in-memory)

For local manual testing and E2E coverage, the repository boots with a small social graph:

- `alice` (id `1`) has an accepted friendship with `bob` (id `2`)
- `alice` has an incoming pending request from `charlie` (id `3`)
- `alice` has an outgoing pending request to `diana` (id `4`)
- Additional relationships also exist for non-alice users
