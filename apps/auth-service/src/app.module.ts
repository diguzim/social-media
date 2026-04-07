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
import { GetProfileByUsernameUseCase } from './core/application/authentication/get-profile-by-username.use-case';
import { UpdatePersonalDataUseCase } from './core/application/authentication/update-personal-data.use-case';
import { RabbitMqEventPublisher } from './infra/events/rabbitmq-event.publisher';
import { CreateEmailVerificationTokenUseCase } from './core/application/email-verification/create-email-verification-token.use-case';
import { ConfirmEmailVerificationUseCase } from './core/application/email-verification/confirm-email-verification.use-case';
import { RequestEmailVerificationUseCase } from './core/application/email-verification/request-email-verification.use-case';
import {
  LogContextInterceptor,
  getCorrelationId,
  getRequestDurationMs,
  getUserId,
} from '@repo/log-context';

const serviceName = 'auth-service';
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
        customProps: () => ({
          correlationId: getCorrelationId(),
          userId: getUserId(),
          requestDurationMs: getRequestDurationMs(),
          service: serviceName,
          environment,
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
    GetProfileByUsernameUseCase,
    UpdatePersonalDataUseCase,
    RabbitMqEventPublisher,
    CreateEmailVerificationTokenUseCase,
    ConfirmEmailVerificationUseCase,
    RequestEmailVerificationUseCase,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogContextInterceptor,
    },
  ],
})
export class AppModule {}
