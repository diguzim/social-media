export const AUTH_COMMANDS = {
  register: "auth.register",
  login: "auth.login",
  getProfile: "auth.getProfile",
  createEmailVerificationToken: "auth.createEmailVerificationToken",
  confirmEmailVerification: "auth.confirmEmailVerification",
  requestEmailVerification: "auth.requestEmailVerification",
} as const;
