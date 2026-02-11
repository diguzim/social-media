export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginReply {
  id: string;
  email: string;
}
