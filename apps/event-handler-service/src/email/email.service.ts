import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "node:crypto";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Sends a verification email to a newly registered user.
   *
   * TODO: Replace the fake log delivery with a real email provider
   *       (e.g. Resend, SendGrid, Nodemailer) and persist the token
   *       so the /auth/verify-email route can validate it later.
   */
  async sendVerificationEmail(to: string, name: string): Promise<void> {
    const token = crypto.randomBytes(32).toString("hex");
    const appUrl = this.configService.get<string>(
      "APP_URL",
      "http://localhost:3000",
    );
    const confirmationLink = `${appUrl}/auth/verify-email?token=${token}`;

    // FAKE DELIVERY — log the link so it is visible during development
    this.logger.log(
      `[FAKE EMAIL] Sending verification email to ${name} <${to}>`,
    );
    this.logger.log(`[FAKE EMAIL] Confirmation link: ${confirmationLink}`);
  }
}
