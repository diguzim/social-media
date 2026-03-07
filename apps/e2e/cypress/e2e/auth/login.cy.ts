describe("User Login Flow", () => {
  beforeEach(() => {
    // Seed a test user via registration before each test
    // In production, you might use an API call to seed data
    cy.visitRegister();

    const testUser = {
      name: "Test User",
      email: `testuser+${Date.now()}@example.com`,
      password: "TestPass123!",
    };

    // Store in window for use in test
    cy.window().then((win) => {
      (win as any).testUser = testUser;
    });

    cy.registerUser(testUser);

    // Should redirect to login
    cy.url().should("include", "/login");
  });

  it("should successfully login with valid credentials", () => {
    cy.window().then((win) => {
      const testUser = (win as any).testUser;

      // Fill login form
      cy.getByTestId("login-email-input")
        .should("be.visible")
        .type(testUser.email);
      cy.getByTestId("login-password-input")
        .should("be.visible")
        .type(testUser.password);

      // Submit form
      cy.getByTestId("login-submit-button").should("be.visible").click();

      // Should be redirected to home page
      cy.getByTestId("home-welcome-title").should(
        "contain.text",
        `Welcome ${testUser.name}!`,
      );
    });
  });

  it("should show error for invalid email", () => {
    cy.visitLogin();

    // Enter invalid credentials
    cy.getByTestId("login-email-input").type("nonexistent@example.com");
    cy.getByTestId("login-password-input").type("WrongPassword123!");

    // Submit form
    cy.getByTestId("login-submit-button").click();

    // Should show error message
    cy.getByTestId("login-error-message").should(
      "include.text",
      "Invalid credentials",
    );
  });

  it("should show error for wrong password", () => {
    cy.window().then((win) => {
      const testUser = (win as any).testUser;

      cy.visitLogin();

      // Correct email, wrong password
      cy.getByTestId("login-email-input").type(testUser.email);
      cy.getByTestId("login-password-input").type("WrongPassword123!");

      // Submit form
      cy.getByTestId("login-submit-button").click();

      // Should show error message
      cy.getByTestId("login-error-message").should(
        "include.text",
        "Invalid credentials",
      );
    });
  });

  it("should have link to register page", () => {
    cy.visitLogin();

    // Should have a link to registration
    cy.getByTestId("login-create-account-link").should("be.visible").click();

    // Should navigate to register page
    cy.url().should("include", "/register");
    cy.getByTestId("register-page-title").should("be.visible");
  });
});
