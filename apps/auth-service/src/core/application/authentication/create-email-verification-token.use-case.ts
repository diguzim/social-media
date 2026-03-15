import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { EmailVerificationTokenRepository } from 'src/core/domain/user/email-verification-token.repository';

export interface CreateEmailVerificationTokenInput {
  userId: string;
}

export interface CreateEmailVerificationTokenOutput {
  verificationToken: string;
  expiresAt: string;
}

@Injectable()
export class CreateEmailVerificationTokenUseCase {
  private static readonly TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
  ) {}

  async execute(
    input: CreateEmailVerificationTokenInput,
  ): Promise<CreateEmailVerificationTokenOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(verificationToken);
    const expiresAt = new Date(
      Date.now() + CreateEmailVerificationTokenUseCase.TOKEN_TTL_MS,
    );

    await this.emailVerificationTokenRepository.invalidateActiveTokensByUserId(
      input.userId,
    );

    await this.emailVerificationTokenRepository.create({
      userId: input.userId,
      tokenHash,
      expiresAt,
    });

    return {
      verificationToken,
      expiresAt: expiresAt.toISOString(),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
