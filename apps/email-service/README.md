# email-service

Standalone email delivery microservice.

## Features

- Synchronous RPC email sending (`RPC.EMAIL_COMMANDS`)
- Asynchronous RabbitMQ consumption for user registration verification emails
- Pluggable provider strategy (`EMAIL_PROVIDER=logging|sendgrid`)
- In-memory delivery status tracking

## Run

```bash
pnpm --filter email-service dev
```

## Environment

Copy `.env.example` to `.env` and configure provider credentials when using SendGrid.

## Sentry Setup

The service initializes Sentry when `SENTRY_DSN` is present.

Required variables:

```env
SENTRY_DSN=your-dsn
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0
```

Sentry project details created for this service:

- Organization: `rodrigo-marcondes`
- Project slug: `email-service`
- Region URL: `https://us.sentry.io`

If you already have a local `.env`, add the DSN there and restart `email-service`.
