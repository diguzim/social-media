import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type EmailProvider,
  type SendEmailProviderInput,
  type SendEmailProviderResult,
} from "./email-provider";

interface SendGridAcceptedResponse {
  message?: string;
}

@Injectable()
export class SendGridEmailProvider implements EmailProvider {
  readonly providerName = "sendgrid";

  constructor(private readonly configService: ConfigService) {}

  async send(input: SendEmailProviderInput): Promise<SendEmailProviderResult> {
    const apiKey = this.configService.get<string>("SENDGRID_API_KEY");

    if (!apiKey) {
      throw new InternalServerErrorException(
        "Missing SENDGRID_API_KEY configuration",
      );
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: input.to.map((email) => ({ email })),
          },
        ],
        from: {
          email: input.from,
        },
        subject: input.subject,
        content: [
          {
            type: "text/plain",
            value: input.body,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new InternalServerErrorException(
        `SendGrid delivery failed with status ${response.status}: ${body}`,
      );
    }

    const payload = (await response
      .json()
      .catch(() => ({}))) as SendGridAcceptedResponse;

    return {
      providerMessageId: payload.message ?? null,
    };
  }
}
