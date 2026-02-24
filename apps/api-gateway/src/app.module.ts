import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req, res) => ({
          correlationId: getCorrelationId(),
          userId:
            (req as { user?: { userId?: string } }).user?.userId ?? getUserId(),
          requestDurationMs:
            (res as { responseTime?: number }).responseTime ??
            getRequestDurationMs(),
          service: 'api-gateway',
          environment: process.env.NODE_ENV ?? 'development',
        }),
      },
    }),
    AuthModule,
    PostsModule,
  ],
  controllers: [UsersController, PostsController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogContextMiddleware).forRoutes('*');
  }
}
