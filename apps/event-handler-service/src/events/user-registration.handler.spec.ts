import { UserRegistrationHandler } from "./user-registration.handler";

describe("UserRegistrationHandler", () => {
  let handler: UserRegistrationHandler;

  beforeEach(() => {
    handler = new UserRegistrationHandler();
  });

  it("should handle user registered event", async () => {
    const logSpy = jest.spyOn(handler["logger"], "log");

    const event = {
      userId: "user-1",
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date().toISOString(),
    };

    await handler.handleUserRegistered(event);

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Processing user registration event"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("successfully registered"),
    );
  });
});
