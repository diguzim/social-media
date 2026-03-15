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

  it("should send verification email when handling user registration", async () => {
    const event = {
      userId: "user-1",
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date().toISOString(),
    };

    await handler.handleUserRegistered(event);

    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      event.email,
      event.name,
    );
    expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });
});
