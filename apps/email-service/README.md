# email-service

Standalone email delivery microservice.

## Features

- Synchronous RPC email sending (`RPC.EMAIL_COMMANDS`)
- Asynchronous RabbitMQ consumption for user registration verification emails
- Pluggable provider strategy (`EMAIL_PROVIDER=logging|sendgrid|resend`)
- In-memory delivery status tracking

## Run

```bash
pnpm --filter email-service dev
```

## Environment

Copy `.env.example` to `.env` and configure provider credentials for the selected provider.

- `EMAIL_PROVIDER=logging` uses the local logger provider (no external API calls).
- `EMAIL_PROVIDER=sendgrid` requires `SENDGRID_API_KEY`.
- `EMAIL_PROVIDER=resend` requires `RESEND_API_KEY`.

For live delivery tests, set `EMAIL_PROVIDER=sendgrid` and use a verified sender address in `DEFAULT_FROM_EMAIL`.
If you want the seeded auth account to receive test mail, the workspace seed user 1 now uses `rodrigomarcondes2000@gmail.com`.

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
