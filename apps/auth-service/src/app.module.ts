import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthController } from './auth/auth.controller';
import { DatabaseModule } from './infra/database/database.module';
import { RegisterUseCase } from './core/application/authentication/register.use-case';
import { LoginUseCase } from './core/application/authentication/login.use-case';
import { GetProfileUseCase } from './core/application/authentication/get-profile.use-case';
import { RabbitMqEventPublisher } from './infra/events/rabbitmq-event.publisher';
import {
  LogContextInterceptor,
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
        customProps: () => ({
          correlationId: getCorrelationId(),
          userId: getUserId(),
          requestDurationMs: getRequestDurationMs(),
          service: 'auth-service',
          environment: process.env.NODE_ENV ?? 'development',
        }),
      },
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    GetProfileUseCase,
    RabbitMqEventPublisher,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogContextInterceptor,
    },
  ],
})
export class AppModule {}
