import type { EmailDeliveryStatus } from "./send-email.contract.js";

export interface GetEmailDeliveryStatusRequest {
  deliveryId: string;
  correlationId?: string;
}

export interface GetEmailDeliveryStatusReply {
  deliveryId: string;
  status: EmailDeliveryStatus;
  provider: string;
  providerMessageId: string | null;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  recipients: string[];
  from: string;
  subject: string;
  lastError: string | null;
}
