import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { DatabaseModule } from './infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [],
})
export class AppModule {}
