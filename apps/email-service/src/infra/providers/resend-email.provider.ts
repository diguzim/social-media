import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type EmailProvider,
  type SendEmailProviderInput,
  type SendEmailProviderResult,
} from "./email-provider";

interface ResendAcceptedResponse {
  id?: string;
}

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  readonly providerName = "resend";

  constructor(private readonly configService: ConfigService) {}

  async send(input: SendEmailProviderInput): Promise<SendEmailProviderResult> {
    const apiKey = this.configService.get<string>("RESEND_API_KEY");

    if (!apiKey) {
      throw new InternalServerErrorException(
        "Missing RESEND_API_KEY configuration",
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from,
        to: input.to,
        subject: input.subject,
        text: input.body,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new InternalServerErrorException(
        `Resend delivery failed with status ${response.status}: ${body}`,
      );
    }

    const payload = (await response
      .json()
      .catch(() => ({}))) as ResendAcceptedResponse;

    return {
      providerMessageId: payload.id ?? null,
    };
  }
}
