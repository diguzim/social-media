import { EmailVerificationToken } from './email-verification-token.entity';

export interface CreateEmailVerificationTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export abstract class EmailVerificationTokenRepository {
  abstract create(
    data: CreateEmailVerificationTokenData,
  ): Promise<EmailVerificationToken>;

  abstract findByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null>;

  abstract invalidateActiveTokensByUserId(userId: string): Promise<void>;

  /** Mark a specific token as consumed (one-time use). */
  abstract consume(
    tokenId: string,
    consumedAt: Date,
  ): Promise<EmailVerificationToken>;
}
