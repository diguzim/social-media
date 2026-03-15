import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailVerificationTokenRepository } from 'src/core/domain/user/email-verification-token.repository';
import { UserRepository } from 'src/core/domain/user/user.repository';

export interface CreateEmailVerificationTokenInput {
  userId: string;
}

export interface CreateEmailVerificationTokenOutput {
  /** Raw token to be embedded in the confirmation link. Never persisted as-is. */
  verificationToken: string;
  expiresAt: Date;
}

const TOKEN_TTL_HOURS = 24;

@Injectable()
export class CreateEmailVerificationTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: EmailVerificationTokenRepository,
  ) {}

  async execute(
    input: CreateEmailVerificationTokenInput,
  ): Promise<CreateEmailVerificationTokenOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await this.tokenRepository.create({
      userId: input.userId,
      tokenHash,
      expiresAt,
    });

    return { verificationToken: rawToken, expiresAt };
  }
}
