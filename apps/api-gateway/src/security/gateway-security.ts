import type { INestApplication } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import helmet from 'helmet';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000'];
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

function parseAllowedOrigins(value: string | undefined): string[] {
  const parsedOrigins = (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return parsedOrigins.length > 0 ? parsedOrigins : DEFAULT_ALLOWED_ORIGINS;
}

function createCorsOptions(allowedOrigins: string[]): CorsOptions {
  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ALLOWED_METHODS,
    credentials: true,
  };
}

export function getAllowedCorsOrigins(): string[] {
  return parseAllowedOrigins(
    process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN,
  );
}

export function configureGatewaySecurity(app: INestApplication): void {
  app.use(helmet());
  app.enableCors(createCorsOptions(getAllowedCorsOrigins()));
}
