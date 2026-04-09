import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { UsersController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';
import { FriendsController } from './friends/friends.controller';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ImagesModule } from './images/images.module';
import { FriendsModule } from './friends/friends.module';
import {
  LogContextMiddleware,
  getCorrelationId,
  getRequestDurationMs,
  getUserId,
} from '@repo/log-context';

const serviceName = 'api-gateway';
const environment = process.env.NODE_ENV ?? 'development';
const logsToLokiEnabled = (process.env.LOGS_TO_LOKI ?? 'true') === 'true';
const lokiHost = `${process.env.LOKI_HOST ?? 'http://localhost'}:${process.env.LOKI_PORT ?? '3100'}`;
const DEFAULT_THROTTLE_LIMIT = 120;
const DEFAULT_THROTTLE_TTL_MS = 60_000;

function parseThrottleNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

const lokiTransport = logsToLokiEnabled
  ? {
      target: 'pino-loki',
      options: {
        host: lokiHost,
        batching: {
          interval: 5,
        },
        labels: {
          service: serviceName,
          environment,
        },
      },
    }
  : undefined;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: parseThrottleNumber(
            configService.get<string>('THROTTLE_TTL_MS'),
            DEFAULT_THROTTLE_TTL_MS,
          ),
          limit: parseThrottleNumber(
            configService.get<string>('THROTTLE_LIMIT'),
            DEFAULT_THROTTLE_LIMIT,
          ),
        },
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: lokiTransport,
        customProps: (req, res) => ({
          correlationId: getCorrelationId(),
          userId:
            (req as { user?: { userId?: string } }).user?.userId ?? getUserId(),
          requestDurationMs:
            (res as { responseTime?: number }).responseTime ??
            getRequestDurationMs(),
          service: serviceName,
          environment,
        }),
      },
    }),
    AuthModule,
    PostsModule,
    ImagesModule,
    FriendsModule,
  ],
  controllers: [UsersController, PostsController, FriendsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        validationError: {
          target: false,
          value: false,
        },
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogContextMiddleware).forRoutes('*');
  }
}
