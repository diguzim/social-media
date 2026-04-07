export interface GetProfileByUsernameRequest {
  username: string;
  correlationId?: string;
}

export interface GetProfileByUsernameReply {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  gender?: string | null;
  about?: string | null;
}
