import { Module, Provider } from '@nestjs/common';
import { InMemoryUserRepository } from './in-memory/repositories/in-memory-user.repository';
import { UserRepository } from 'src/core/domain/user/user.repository';

const inMemoryProviders: Provider[] = [
  {
    provide: UserRepository,
    useClass: InMemoryUserRepository,
  },
];

@Module({
  providers: [...inMemoryProviders],
  exports: [UserRepository],
})
export class DatabaseModule {}
