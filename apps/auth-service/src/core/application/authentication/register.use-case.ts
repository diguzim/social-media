import { UserRepository } from 'src/core/domain/user/user.repository';
import bcrypt from 'bcrypt';
import { ConflictException, Injectable } from '@nestjs/common';
import { USER_EVENTS, type UserRegisteredEvent } from '@repo/events';
import { RabbitMqEventPublisher } from 'src/infra/events/rabbitmq-event.publisher';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutput {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: RabbitMqEventPublisher,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(input.password, salt);
    const createUserData = {
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
    };

    const user = await this.userRepository.create(createUserData);

    await this.eventPublisher.publish(USER_EVENTS.REGISTERED, {
      userId: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    } as UserRegisteredEvent);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
