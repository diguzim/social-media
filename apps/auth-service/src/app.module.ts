import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { DatabaseModule } from './infra/database/database.module';
import { RegisterUseCase } from './core/application/authentication/register.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [RegisterUseCase],
})
export class AppModule {}
