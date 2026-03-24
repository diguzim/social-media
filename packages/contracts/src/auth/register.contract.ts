export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  correlationId?: string;
}

export interface RegisterReply {
  id: string;
  username: string;
  email: string;
}

// Legacy exports for backward compatibility
export type RegisterMessage = RegisterRequest;
export type RegisterResponse = RegisterReply;
