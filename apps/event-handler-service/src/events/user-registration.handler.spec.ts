import { UserRegistrationHandler } from "./user-registration.handler";
import { EmailService } from "../email/email.service";

describe("UserRegistrationHandler", () => {
  let handler: UserRegistrationHandler;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    emailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EmailService>;

    handler = new UserRegistrationHandler(emailService);
  });

  it("should send verification email when handling user registration", () => {
    const event = {
      userId: "user-1",
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date().toISOString(),
      verificationToken: "raw-token-abc123",
      tokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    handler.handleUserRegistered(event);

    expect(emailService.sendVerificationEmail.mock.calls).toEqual([
      [event.email, event.name, event.verificationToken],
    ]);
  });

  it("should send verification email when handling a verification re-request", () => {
    const event = {
      userId: "user-1",
      name: "John Doe",
      email: "john@example.com",
      requestedAt: new Date().toISOString(),
      verificationToken: "raw-token-xyz789",
      tokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    handler.handleVerificationEmailRequested(event);

    expect(emailService.sendVerificationEmail.mock.calls).toEqual([
      [event.email, event.name, event.verificationToken],
    ]);
  });
});
