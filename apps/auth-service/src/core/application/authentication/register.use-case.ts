import { UserRepository } from 'src/core/domain/user/user.repository';
import bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { USER_EVENTS, type UserRegisteredEvent } from '@repo/events';
import { RabbitMqEventPublisher } from 'src/infra/events/rabbitmq-event.publisher';
import { CreateEmailVerificationTokenUseCase } from '../email-verification/create-email-verification-token.use-case';

const RESERVED_USERNAMES = new Set([
  'admin',
  'support',
  'root',
  'system',
  'moderator',
  'help',
  'security',
]);

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function validateUsername(usernameCanonical: string): void {
  if (usernameCanonical.length < 3 || usernameCanonical.length > 30) {
    throw new BadRequestException(
      'Username must be between 3 and 30 characters',
    );
  }

  if (!/^[a-z0-9_-]+$/.test(usernameCanonical)) {
    throw new BadRequestException(
      'Username can only contain lowercase letters, numbers, underscores, and hyphens',
    );
  }

  if (RESERVED_USERNAMES.has(usernameCanonical)) {
    throw new BadRequestException('This username is reserved');
  }
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterOutput {
  id: string;
  name: string;
  username: string;
  email: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: RabbitMqEventPublisher,
    private readonly createEmailVerificationTokenUseCase: CreateEmailVerificationTokenUseCase,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const usernameCanonical = normalizeUsername(input.username);
    validateUsername(usernameCanonical);

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername =
      await this.userRepository.findByUsernameCanonical(usernameCanonical);
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(input.password, salt);
    const createUserData = {
      name: input.name,
      username: usernameCanonical,
      usernameCanonical,
      email: input.email,
      passwordHash: hashedPassword,
    };

    const user = await this.userRepository.create(createUserData);

    const { verificationToken, expiresAt } =
      await this.createEmailVerificationTokenUseCase.execute({
        userId: user.id,
      });

    await this.eventPublisher.publish(USER_EVENTS.REGISTERED, {
      userId: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      verificationToken,
      tokenExpiresAt: expiresAt.toISOString(),
    } as UserRegisteredEvent);

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    };
  }
}
