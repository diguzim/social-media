import { BadRequestException, Injectable } from "@nestjs/common";
import * as crypto from "node:crypto";
import { UserRepository } from "src/core/domain/user/user.repository";
import { EmailVerificationTokenRepository } from "src/core/domain/user/email-verification-token.repository";

export interface ConfirmEmailVerificationInput {
  token: string;
}

export interface ConfirmEmailVerificationOutput {
  status: "verified" | "already_verified";
  emailVerifiedAt: string;
}

@Injectable()
export class ConfirmEmailVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
  ) {}

  async execute(
    input: ConfirmEmailVerificationInput,
  ): Promise<ConfirmEmailVerificationOutput> {
    const tokenHash = this.hashToken(input.token);
    const verificationToken =
      await this.emailVerificationTokenRepository.findByTokenHash(tokenHash);

    if (!verificationToken) {
      throw new BadRequestException("Invalid verification token");
    }

    if (verificationToken.consumedAt) {
      throw new BadRequestException("Verification token already used");
    }

    if (verificationToken.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException("Verification token expired");
    }

    const user = await this.userRepository.findById(verificationToken.userId);

    if (!user) {
      throw new BadRequestException("Invalid verification token");
    }

    const consumedAt = new Date();
    await this.emailVerificationTokenRepository.consume(
      verificationToken.id,
      consumedAt,
    );

    if (user.emailVerifiedAt) {
      return {
        status: "already_verified",
        emailVerifiedAt: user.emailVerifiedAt.toISOString(),
      };
    }

    const updatedUser = await this.userRepository.markEmailVerified(
      user.id,
      consumedAt,
    );

    if (!updatedUser || !updatedUser.emailVerifiedAt) {
      throw new BadRequestException("Unable to verify email");
    }

    return {
      status: "verified",
      emailVerifiedAt: updatedUser.emailVerifiedAt.toISOString(),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
