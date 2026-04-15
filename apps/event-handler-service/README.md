# Event Handler Service

Background worker service that listens to domain events via RabbitMQ and performs asynchronous side effects. This keeps event handling logic decoupled from the services that emit events.

Email delivery handling has been migrated to `email-service`. Legacy user-email handlers in this service are disabled by default.

## Purpose

- Optionally listen to domain events published by other services (legacy user-email handlers are feature-flagged)
- Execute event handlers that perform business logic and side effects
- Process messages asynchronously to avoid blocking upstream services
- Keep business logic independent from event-driven workflows
- Expose health check endpoint for monitoring

## Architecture

```
Auth Service
  ↓ publishes user.registered / user.emailVerificationRequested events
RabbitMQ Topic Exchange (social-media.events)
  ↓ routes to queue by key
email-service
  ├─→ Consume from queue
  ├─→ Execute handlers (EmailService)
  └─→ Track delivery status

event-handler-service (legacy path only)
  ├─→ Consume from queue
  ├─→ Execute handlers (UserRegistrationHandler)
  └─→ Health check endpoint
```

## Event Handlers

### UserRegistrationHandler

Legacy path: disabled by default.

**Event**: `user.registered`\
**Queue**: `social-media.user-registered`\
**Routing Key**: `user.registered`

Triggered when a user successfully registers. Sends the initial verification email.

**Event Payload**:

```typescript
{
  userId: string; // Unique user ID
  name: string; // User's full name
  email: string; // User's email address
  createdAt: string; // ISO timestamp of registration
  verificationToken: string; // Raw token to embed in the confirmation link
  tokenExpiresAt: string; // ISO timestamp when the token expires (24h from creation)
}
```

The verification link sent in the email points to `http://localhost:3000/verify-email?token={verificationToken}`.

### VerificationEmailRequestedHandler (same consumer)

Legacy path: disabled by default.

**Event**: `user.emailVerificationRequested`\
**Queue**: `social-media.user-registered`\
**Routing Key**: `user.emailVerificationRequested`

Triggered when a user requests a verification email resend.

**Event Payload**:

```typescript
{
  userId: string;
  name: string;
  email: string;
  requestedAt: string; // ISO timestamp of resend request
  verificationToken: string;
  tokenExpiresAt: string;
}
```

## RabbitMQ Configuration

### Message Exchange

- **Exchange**: `social-media.events`
  - Type: Topic (allow pattern-based routing)
  - Durable: Yes (survives broker restart)
  - Auto-delete: No

- **Queue**: `social-media.user-registered`
  - Durable: Yes (survives broker restart)
  - Exclusive: No (not bound to a connection)
  - Auto-delete: No

- **Binding**: Queue binds to exchange with routing keys `user.registered` and `user.emailVerificationRequested`

### Connection

- **URL**: `amqp://guest:guest@localhost:5672`
- **Mode**: Direct connection (no load balancing)
- **Reconnection**: Automatic with incremental backoff
- **Health**: Tracked by RabbitMqHealthService

## Health Check

Endpoint: `GET /health`

Returns connection and queue status:

```json
{
  "status": "ok",
  "rabbitmq": {
    "connected": true,
    "url": "amqp://guest:guest@localhost:5672",
    "exchange": "social-media.events",
    "queue": "social-media.user-registered",
    "lastError": null
  }
}
```

Usage:

```sh
curl http://localhost:4003/health
```

## Configuration

Environment variables (see `.env.example`):

```env
PORT=4003
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_EXCHANGE=social-media.events
RABBITMQ_USER_REGISTERED_QUEUE=social-media.user-registered
EVENT_HANDLER_ENABLE_USER_EMAIL_HANDLERS=false
LOGS_TO_LOKI=true
LOKI_HOST=http://localhost
LOKI_PORT=3100
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0
```

## Message Flow

```
Auth Service.RegisterUseCase
  ↓ creates user
  ↓
RabbitMqEventPublisher.publish(USER_EVENTS.REGISTERED)
  ↓
Message sent to exchange with routing key "user.registered"
  ↓
RabbitMQ routes to "social-media.user-registered" queue
  ↓
email-service consumes from queue by default
  ↓
EmailService sends verification email

event-handler-service legacy flow (optional)
  ↓
channel.consume() listener receives message
  ↓
UserRegistrationHandler.handleUserRegistered(event) when EVENT_HANDLER_ENABLE_USER_EMAIL_HANDLERS=true
  ↓ [Currently: Log the event]
  → [Ready for: Send email, create profile, analytics, etc.]
  ↓
Message acknowledged (ack) or requeued on error (nack)
```

## Error Handling

- **Handler Errors**: Message is nack'd and requeued for retry
- **Connection Loss**: Automatic reconnection with exponential backoff
- **Graceful Shutdown**: Closes channel and connection on service termination
- **Health Tracking**: RabbitMqHealthService logs connection failures
- **Observability**: Structured logging with request correlation IDs

## Running

Development mode (watch for changes):

```sh
pnpm --filter event-handler-service dev
```

From root:

```sh
pnpm dev
```

The service will start consuming messages from RabbitMQ.

## Testing

Run the test suite:

```sh
pnpm --filter event-handler-service test
```

Tests cover:

- RabbitMQ consumer initialization
- Event handler execution
- User registration event processing
- Health check endpoint
- Connection error handling

## Monitoring

Check if the service is running and RabbitMQ is connected:

```sh
curl http://localhost:4003/health
```

View service logs (in pnpm dev output):

```
[event-handler-service] RabbitMQ connected to amqp://guest:guest@localhost:5672
[event-handler-service] Processing user registration event: user-1
[event-handler-service] User john@example.com successfully registered
```

## Tech Stack

- **NestJS** - Framework
- **amqplib 0.10.5** - RabbitMQ AMQP client
- **Pino** - Structured logging
- **Jest** - Testing framework
- **TypeScript 5.7** - Type safety
- **Sentry** - Error monitoring (`@sentry/node`)

## Future Enhancements

- [ ] Implement email notifications
- [ ] Add message retry with exponential backoff
- [ ] Dead-letter queue for permanently failed messages
- [ ] Event sourcing for audit trail
- [ ] Multiple event handlers per topic
- [ ] Distributed tracing with OpenTelemetry
- [ ] Metrics collection (Prometheus)
