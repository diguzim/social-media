export interface SendEmailProviderInput {
  to: string[];
  from: string;
  subject: string;
  body: string;
}

export interface SendEmailProviderResult {
  providerMessageId: string | null;
}

export interface EmailProvider {
  readonly providerName: string;
  send(input: SendEmailProviderInput): Promise<SendEmailProviderResult>;
}

export const EMAIL_PROVIDER = "EMAIL_PROVIDER";
