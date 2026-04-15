export const USER_EVENTS = {
  REGISTERED: "user.registered",
  EMAIL_VERIFICATION_REQUESTED: "user.emailVerificationRequested",
  EMAIL_DELIVERY_STATUS_CHANGED: "user.emailDeliveryStatusChanged",
} as const;

export const EVENT_BUS = {
  EXCHANGE: "social-media.events",
  USER_REGISTERED_QUEUE: "social-media.user-registered",
} as const;

export interface UserRegisteredEvent {
  userId: string;
  name: string;
  email: string;
  createdAt: string; // ISO string
  /** Raw verification token to embed in the confirmation link. */
  verificationToken: string;
  /** ISO string expiry of the token. */
  tokenExpiresAt: string;
}

export interface VerificationEmailRequestedEvent {
  userId: string;
  name: string;
  email: string;
  requestedAt: string; // ISO string
  /** Raw verification token to embed in the confirmation link. */
  verificationToken: string;
  /** ISO string expiry of the token. */
  tokenExpiresAt: string;
}

export type EmailDeliveryStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "bounced";

export interface UserEmailDeliveryStatusChangedEvent {
  userId: string;
  deliveryId: string;
  email: string;
  status: EmailDeliveryStatus;
  provider: string;
  providerMessageId: string | null;
  updatedAt: string;
}
