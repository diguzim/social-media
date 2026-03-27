import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UsersController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
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
  ],
  controllers: [UsersController, PostsController],
  providers: [
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
