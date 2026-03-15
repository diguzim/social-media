import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailVerificationTokenRepository } from 'src/core/domain/user/email-verification-token.repository';
import { UserRepository } from 'src/core/domain/user/user.repository';

export interface ConfirmEmailVerificationInput {
  token: string;
}

export interface ConfirmEmailVerificationOutput {
  status: 'verified' | 'already_verified';
  emailVerifiedAt: Date;
}

@Injectable()
export class ConfirmEmailVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: EmailVerificationTokenRepository,
  ) {}

  async execute(
    input: ConfirmEmailVerificationInput,
  ): Promise<ConfirmEmailVerificationOutput> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(input.token)
      .digest('hex');

    const tokenRecord = await this.tokenRepository.findByTokenHash(tokenHash);

    if (!tokenRecord) {
      throw new NotFoundException('Verification token not found');
    }

    if (tokenRecord.isExpired) {
      throw new BadRequestException('Verification token has expired');
    }

    const user = await this.userRepository.findById(tokenRecord.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Idempotent: already verified users get a success response
    if (user.emailVerifiedAt !== null) {
      return {
        status: 'already_verified',
        emailVerifiedAt: user.emailVerifiedAt,
      };
    }

    if (tokenRecord.isConsumed) {
      throw new BadRequestException('Verification token has already been used');
    }

    const now = new Date();
    await this.tokenRepository.consume(tokenRecord.id, now);
    const updatedUser = await this.userRepository.markEmailVerified(
      user.id,
      now,
    );

    return {
      status: 'verified',
      emailVerifiedAt: updatedUser.emailVerifiedAt!,
    };
  }
}
