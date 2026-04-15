import type { EmailDeliveryStatus } from "./send-email.contract.js";

export interface SendVerificationEmailRequest {
  email: string;
  name: string;
  verificationToken: string;
  correlationId?: string;
}

export interface SendVerificationEmailReply {
  deliveryId: string;
  status: EmailDeliveryStatus;
  provider: string;
  providerMessageId: string | null;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  recipients: string[];
}
