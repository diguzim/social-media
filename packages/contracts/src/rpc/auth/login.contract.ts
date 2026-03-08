export interface LoginRequest {
  email: string;
  password: string;
  correlationId?: string;
}

export interface LoginReply {
  id: string;
  email: string;
  accessToken: string;
}
