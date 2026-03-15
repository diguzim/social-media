import { Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_EVENTS,
  type VerificationEmailRequestedEvent,
} from '@repo/events';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { RabbitMqEventPublisher } from 'src/infra/events/rabbitmq-event.publisher';
import { CreateEmailVerificationTokenUseCase } from 'src/core/application/email-verification/create-email-verification-token.use-case';

export interface RequestEmailVerificationInput {
  userId: string;
}

export interface RequestEmailVerificationOutput {
  queued: boolean;
}

/**
 * Requests a new verification email for a user.
 * Creates a fresh token and emits user.emailVerificationRequested so the
 * event-handler-service can pick it up and (re-)send the email.
 */
@Injectable()
export class RequestEmailVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: RabbitMqEventPublisher,
    private readonly createTokenUseCase: CreateEmailVerificationTokenUseCase,
  ) {}

  async execute(
    input: RequestEmailVerificationInput,
  ): Promise<RequestEmailVerificationOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Already verified — nothing to do
    if (user.emailVerifiedAt !== null) {
      return { queued: false };
    }

    const { verificationToken, expiresAt } =
      await this.createTokenUseCase.execute({ userId: user.id });

    const event: VerificationEmailRequestedEvent = {
      userId: user.id,
      name: user.name,
      email: user.email,
      requestedAt: new Date().toISOString(),
      verificationToken,
      tokenExpiresAt: expiresAt.toISOString(),
    };

    await this.eventPublisher.publish(
      USER_EVENTS.EMAIL_VERIFICATION_REQUESTED,
      event,
    );

    return { queued: true };
  }
}
