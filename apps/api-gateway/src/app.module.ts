import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UsersController } from './users/users.controller';
import { AuthModule } from './auth/auth.module';
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
  ],
  controllers: [UsersController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
