import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { RPC } from "@repo/contracts";
import { EmailService } from "./email.service";

const { EMAIL_COMMANDS } = RPC;

@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @MessagePattern({ cmd: EMAIL_COMMANDS.sendEmail })
  async handleSendEmail(
    request: RPC.SendEmailRequest,
  ): Promise<RPC.SendEmailReply> {
    this.logger.debug("Email service: handling sendEmail", request);

    const result = await this.emailService.sendEmail({
      to: request.to,
      from: request.from,
      subject: request.subject,
      body: request.body,
    });

    return {
      deliveryId: result.id,
      status: result.status,
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      attempts: result.attempts,
      recipients: result.to,
    };
  }

  @MessagePattern({ cmd: EMAIL_COMMANDS.sendVerificationEmail })
  async handleSendVerificationEmail(
    request: RPC.SendVerificationEmailRequest,
  ): Promise<RPC.SendVerificationEmailReply> {
    this.logger.debug("Email service: handling sendVerificationEmail", request);

    const result = await this.emailService.sendVerificationEmail({
      to: request.email,
      name: request.name,
      verificationToken: request.verificationToken,
    });

    return {
      deliveryId: result.id,
      status: result.status,
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      attempts: result.attempts,
      recipients: result.to,
    };
  }

  @MessagePattern({ cmd: EMAIL_COMMANDS.getDeliveryStatus })
  handleGetDeliveryStatus(
    request: RPC.GetEmailDeliveryStatusRequest,
  ): RPC.GetEmailDeliveryStatusReply {
    this.logger.debug("Email service: handling getDeliveryStatus", request);

    const record = this.emailService.getDeliveryStatus(request.deliveryId);

    return {
      deliveryId: record.id,
      status: record.status,
      provider: record.provider,
      providerMessageId: record.providerMessageId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      attempts: record.attempts,
      recipients: record.to,
      from: record.from,
      subject: record.subject,
      lastError: record.lastError,
    };
  }
}
