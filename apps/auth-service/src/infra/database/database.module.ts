import { Module, Provider } from '@nestjs/common';
import { InMemoryUserRepository } from './in-memory/repositories/in-memory-user.repository';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { EmailVerificationTokenRepository } from 'src/core/domain/user/email-verification-token.repository';
import { InMemoryEmailVerificationTokenRepository } from './in-memory/repositories/in-memory-email-verification-token.repository';

const inMemoryProviders: Provider[] = [
  {
    provide: UserRepository,
    useClass: InMemoryUserRepository,
  },
  {
    provide: EmailVerificationTokenRepository,
    useClass: InMemoryEmailVerificationTokenRepository,
  },
];

@Module({
  providers: [...inMemoryProviders],
  exports: [UserRepository, EmailVerificationTokenRepository],
})
export class DatabaseModule {}
