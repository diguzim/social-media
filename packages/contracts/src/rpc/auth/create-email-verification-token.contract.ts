export interface CreateEmailVerificationTokenRequest {
  userId: string;
  correlationId?: string;
}

export interface CreateEmailVerificationTokenReply {
  verificationToken: string;
  expiresAt: string;
}
