import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { DatabaseModule } from './infra/database/database.module';
import { RegisterUseCase } from './core/application/authentication/register.use-case';
import { LoginUseCase } from './core/application/authentication/login.use-case';
import { GetProfileUseCase } from './core/application/authentication/get-profile.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  providers: [RegisterUseCase, LoginUseCase, GetProfileUseCase],
})
export class AppModule {}
