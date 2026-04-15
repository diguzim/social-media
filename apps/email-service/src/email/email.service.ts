import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  EMAIL_PROVIDER,
  type EmailProvider,
} from "../infra/providers/email-provider";
import {
  EmailDeliveryStore,
  type DeliveryRecord,
} from "./email-delivery.store";

export interface SendEmailInput {
  to: string[];
  from?: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(EMAIL_PROVIDER) private readonly provider: EmailProvider,
    private readonly configService: ConfigService,
    private readonly deliveryStore: EmailDeliveryStore,
  ) {}

  async sendEmail(input: SendEmailInput): Promise<DeliveryRecord> {
    const defaultFrom = this.configService.get<string>(
      "DEFAULT_FROM_EMAIL",
      "no-reply@socialmedia.local",
    );

    const queuedRecord = this.deliveryStore.createQueued({
      to: input.to,
      from: input.from ?? defaultFrom,
      subject: input.subject,
      body: input.body,
      provider: this.provider.providerName,
    });

    this.deliveryStore.markSending(queuedRecord.id);

    try {
      const result = await this.provider.send({
        to: queuedRecord.to,
        from: queuedRecord.from,
        subject: queuedRecord.subject,
        body: queuedRecord.body,
      });

      const sentRecord = this.deliveryStore.markSent(
        queuedRecord.id,
        result.providerMessageId,
      );

      if (!sentRecord) {
        throw new ServiceUnavailableException(
          "Failed to persist sent email record",
        );
      }

      this.logger.log(
        `Email ${sentRecord.id} sent via ${this.provider.providerName}`,
      );

      return sentRecord;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.deliveryStore.markFailed(queuedRecord.id, message);
      throw error;
    }
  }

  async sendVerificationEmail(input: {
    to: string;
    name: string;
    verificationToken: string;
  }): Promise<DeliveryRecord> {
    const appUrl = this.configService.get<string>(
      "APP_URL",
      "http://localhost:3000",
    );
    const confirmationLink = `${appUrl}/verify-email?token=${input.verificationToken}`;

    return this.sendEmail({
      to: [input.to],
      subject: "Verify your account",
      body: [
        `Hi ${input.name},`,
        "",
        "Please confirm your account using this link:",
        confirmationLink,
      ].join("\n"),
    });
  }

  getDeliveryStatus(deliveryId: string): DeliveryRecord {
    const record = this.deliveryStore.getById(deliveryId);

    if (!record) {
      throw new NotFoundException("Delivery not found");
    }

    return record;
  }
}
