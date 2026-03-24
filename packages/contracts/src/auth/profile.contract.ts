export interface GetProfileRequest {
  userId: string;
  correlationId?: string;
}

export interface GetProfileReply {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
}
