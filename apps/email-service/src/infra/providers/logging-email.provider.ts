import { Injectable, Logger } from "@nestjs/common";
import {
  type EmailProvider,
  type SendEmailProviderInput,
  type SendEmailProviderResult,
} from "./email-provider";

@Injectable()
export class LoggingEmailProvider implements EmailProvider {
  readonly providerName = "logging";
  private readonly logger = new Logger(LoggingEmailProvider.name);

  send(input: SendEmailProviderInput): Promise<SendEmailProviderResult> {
    this.logger.log(
      `[FAKE EMAIL] Sending to ${input.to.join(", ")} with subject "${input.subject}"`,
    );
    this.logger.log(`[FAKE EMAIL] From: ${input.from}`);
    this.logger.log(`[FAKE EMAIL] Body: ${input.body}`);

    return Promise.resolve({
      providerMessageId: null,
    });
  }
}
