import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { DatabaseModule } from './infra/database/database.module';
import { RegisterUseCase } from './core/application/authentication/register.use-case';
import { LoginUseCase } from './core/application/authentication/login.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [RegisterUseCase, LoginUseCase],
})
export class AppModule {}
