export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  correlationId?: string;
}

export interface RegisterReply {
  id: string;
  email: string;
}

// Legacy exports for backward compatibility
export type RegisterMessage = RegisterRequest;
export type RegisterResponse = RegisterReply;
