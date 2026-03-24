import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Sends a verification email to a newly registered user.
   *
   * The token is generated and stored by auth-service before this is called.
   * The raw token received here is embedded in the link but never persisted again.
   *
   * TODO: Replace the fake log delivery with a real email provider
   *       (e.g. Resend, SendGrid, Nodemailer).
   */
  sendVerificationEmail(
    to: string,
    name: string,
    verificationToken: string,
  ): void {
    const appUrl = this.configService.get<string>(
      "APP_URL",
      "http://localhost:3000",
    );
    const confirmationLink = `${appUrl}/verify-email?token=${verificationToken}`;

    // FAKE DELIVERY — log the link so it is visible during development
    this.logger.log(
      `[FAKE EMAIL] Sending verification email to ${name} <${to}>`,
    );
    this.logger.log(`[FAKE EMAIL] Confirmation link: ${confirmationLink}`);
  }
}
