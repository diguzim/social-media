import { Injectable } from '@nestjs/common';
import { EmailVerificationToken } from 'src/core/domain/user/email-verification-token.entity';
import {
  CreateEmailVerificationTokenData,
  EmailVerificationTokenRepository,
} from 'src/core/domain/user/email-verification-token.repository';

@Injectable()
export class InMemoryEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
  private tokens: EmailVerificationToken[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(
    data: CreateEmailVerificationTokenData,
  ): Promise<EmailVerificationToken> {
    const token = new EmailVerificationToken({
      id: crypto.randomUUID(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      consumedAt: null,
    });

    this.tokens.push(token);
    return token;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null> {
    const token = this.tokens.find((item) => item.tokenHash === tokenHash);
    return token ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async invalidateActiveTokensByUserId(userId: string): Promise<void> {
    const now = new Date();

    this.tokens = this.tokens.map((item) => {
      if (
        item.userId === userId &&
        item.consumedAt === null &&
        item.expiresAt.getTime() > now.getTime()
      ) {
        return new EmailVerificationToken({
          ...item,
          consumedAt: now,
        });
      }

      return item;
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async consume(
    tokenId: string,
    consumedAt: Date,
  ): Promise<EmailVerificationToken> {
    const token = this.tokens.find((item) => item.id === tokenId);
    if (!token) {
      throw new Error(`Token with id ${tokenId} not found`);
    }
    token.consumedAt = consumedAt;
    return token;
  }
}
