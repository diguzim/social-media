export const USER_EVENTS = {
  REGISTERED: "user.registered",
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
