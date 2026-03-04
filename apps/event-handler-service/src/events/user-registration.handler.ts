import { Injectable, Logger } from "@nestjs/common";
import { type UserRegisteredEvent } from "@repo/events";

@Injectable()
export class UserRegistrationHandler {
  private readonly logger = new Logger(UserRegistrationHandler.name);

  async handleUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(
      `Processing user registration event for user ${event.userId}: ${event.email}`,
    );

    // Event handlers can perform various side effects:
    // - Send welcome email
    // - Create user profile or analytics record
    // - Trigger onboarding workflow
    // - Update search indices
    // - Sync with external services
    // etc.

    // For now, just log the event
    this.logger.log(
      `User ${event.name} (${event.email}) successfully registered at ${event.createdAt}`,
    );
  }
}
