import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { RpcExceptionFilter } from '@repo/exception-filters';
import { configureGatewaySecurity } from './security/gateway-security';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const tracesSampleRate = Number(
    process.env.SENTRY_TRACES_SAMPLE_RATE ?? '1.0',
  );

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
      tracesSampleRate: Number.isNaN(tracesSampleRate) ? 1.0 : tracesSampleRate,
    });
  }

  configureGatewaySecurity(app);
  app.useGlobalFilters(new RpcExceptionFilter());
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
