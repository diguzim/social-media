import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UsersController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CorrelationIdMiddleware } from './common/correlation-id/correlation-id.middleware';
import { getCorrelationId } from './common/correlation-id/correlation-id.storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          correlationId: getCorrelationId(),
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
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
