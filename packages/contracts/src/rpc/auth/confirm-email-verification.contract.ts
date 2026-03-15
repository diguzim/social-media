export interface ConfirmEmailVerificationRequest {
  token: string;
  correlationId?: string;
}

export interface ConfirmEmailVerificationReply {
  status: "verified" | "already_verified";
  emailVerifiedAt: string;
}
