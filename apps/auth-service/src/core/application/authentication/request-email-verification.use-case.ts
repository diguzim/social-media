import { Injectable, NotFoundException } from '@nestjs/common';
import { USER_EVENTS, type UserRegisteredEvent } from '@repo/events';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { RabbitMqEventPublisher } from 'src/infra/events/rabbitmq-event.publisher';
import { CreateEmailVerificationTokenUseCase } from '../email-verification/create-email-verification-token.use-case';

export interface RequestEmailVerificationInput {
  userId: string;
}

export interface RequestEmailVerificationOutput {
  queued: boolean;
}

@Injectable()
export class RequestEmailVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: RabbitMqEventPublisher,
    private readonly createEmailVerificationTokenUseCase: CreateEmailVerificationTokenUseCase,
  ) {}

  async execute(
    input: RequestEmailVerificationInput,
  ): Promise<RequestEmailVerificationOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      return { queued: false };
    }

    // Re-use the registration event so the event-handler can send the verification email.
    // TODO: replace with a dedicated VerificationEmailRequestedEvent once the event bus supports it.
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
    } satisfies UserRegisteredEvent);

    return { queued: true };
  }
}
