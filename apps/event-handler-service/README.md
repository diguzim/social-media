# Event Handler Service

Handles domain events emitted from other services. This is a background worker that listens to the event emitter and performs side effects.

## Purpose

- Listen to domain events (e.g., `user.registered`)
- Execute event handlers that perform business logic and side effects
- Keep event handling logic decoupled from the services that emit events

## Handlers

### UserRegistrationHandler

Listens to `user.registered` events and processes user registration side effects.

## Running

```bash
pnpm --filter event-handler-service dev
```

## Testing

```bash
pnpm --filter event-handler-service test
```
