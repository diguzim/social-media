import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { DatabaseModule } from './infra/database/database.module';
import { RegisterUseCase } from './core/application/authentication/register.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [RegisterUseCase],
})
export class AppModule {}
