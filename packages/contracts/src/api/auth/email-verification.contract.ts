export interface ConfirmEmailVerificationRequest {
  token: string;
}

export interface ConfirmEmailVerificationResponse {
  status: "verified" | "already_verified";
  emailVerifiedAt: string;
}

export interface RequestEmailVerificationResponse {
  message: string;
}
