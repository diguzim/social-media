import { Injectable, Logger } from "@nestjs/common";
import {
  type UserRegisteredEvent,
  type VerificationEmailRequestedEvent,
} from "@repo/events";
import { EmailService } from "../email/email.service";

@Injectable()
export class UserRegistrationHandler {
  private readonly logger = new Logger(UserRegistrationHandler.name);

  constructor(private readonly emailService: EmailService) {}

  handleUserRegistered(event: UserRegisteredEvent): void {
    this.logger.log(
      `Processing user registration event for user ${event.userId}: ${event.email}`,
    );

    this.emailService.sendVerificationEmail(
      event.email,
      event.name,
      event.verificationToken,
    );

    this.logger.log(
      `User ${event.name} (${event.email}) successfully registered at ${event.createdAt}`,
    );
  }

  handleVerificationEmailRequested(
    event: VerificationEmailRequestedEvent,
  ): void {
    this.logger.log(
      `Processing verification email request for user ${event.userId}: ${event.email}`,
    );

    this.emailService.sendVerificationEmail(
      event.email,
      event.name,
      event.verificationToken,
    );

    this.logger.log(
      `Verification email re-requested for ${event.name} (${event.email}) at ${event.requestedAt}`,
    );
  }
}
