export type EmailDeliveryStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "bounced";

export interface SendEmailRequest {
  to: string[];
  from?: string;
  subject: string;
  body: string;
  correlationId?: string;
}

export interface SendEmailReply {
  deliveryId: string;
  status: EmailDeliveryStatus;
  provider: string;
  providerMessageId: string | null;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  recipients: string[];
}
