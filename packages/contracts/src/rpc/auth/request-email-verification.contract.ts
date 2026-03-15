export interface RequestEmailVerificationRequest {
  userId: string;
  correlationId?: string;
}

export interface RequestEmailVerificationReply {
  queued: boolean;
}
