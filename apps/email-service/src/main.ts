import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AllExceptionsFilter } from "@repo/exception-filters";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/node";

async function bootstrap() {
  const tracesSampleRate = Number(
    process.env.SENTRY_TRACES_SAMPLE_RATE ?? "1.0",
  );

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      serverName: "email-service",
      environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
      tracesSampleRate: Number.isNaN(tracesSampleRate) ? 1.0 : tracesSampleRate,
      initialScope: {
        tags: {
          service: "email-service",
        },
      },
    });
  }

  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.TCP,
        options: {
          port: parseInt(process.env.PORT || "4006", 10),
        },
      },
    );

    app.useGlobalFilters(new AllExceptionsFilter());
    await app.listen();
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        service: "email-service",
        phase: "bootstrap",
      },
    });
    throw error;
  }
}

void bootstrap();
