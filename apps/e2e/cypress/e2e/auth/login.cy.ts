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

    // Alias common login page elements (guaranteed to exist)
    cy.getByTestId("login-email-input").as("loginEmailInput");
    cy.getByTestId("login-password-input").as("loginPasswordInput");
    cy.getByTestId("login-submit-button").as("loginSubmitButton");
    cy.getByTestId("login-create-account-link").as("loginCreateAccountLink");
  });

  it("should successfully login with valid credentials", () => {
    cy.window().then((win) => {
      const testUser = (win as any).testUser;

      // Fill login form
      cy.get("@loginEmailInput").should("be.visible").type(testUser.email);
      cy.get("@loginPasswordInput")
        .should("be.visible")
        .type(testUser.password);

      // Submit form
      cy.get("@loginSubmitButton").should("be.visible").click();

      // Should be redirected to home page
      cy.getByTestId("home-welcome-title").should(
        "contain.text",
        `Welcome ${testUser.name}!`,
      );
    });
  });

  it("should show error for invalid email", () => {
    cy.visitLogin();

    // Alias elements for this test
    cy.getByTestId("login-email-input").as("loginEmailInput");
    cy.getByTestId("login-password-input").as("loginPasswordInput");
    cy.getByTestId("login-submit-button").as("loginSubmitButton");

    // Enter invalid credentials
    cy.get("@loginEmailInput").type("nonexistent@example.com");
    cy.get("@loginPasswordInput").type("WrongPassword123!");

    // Submit form
    cy.get("@loginSubmitButton").click();

    // Should show error message (alias it after it appears)
    cy.getByTestId("login-error-message").as("loginErrorMessage");
    cy.get("@loginErrorMessage").should("include.text", "Invalid credentials");
  });

  it("should show error for wrong password", () => {
    cy.window().then((win) => {
      const testUser = (win as any).testUser;

      cy.visitLogin();

      // Alias elements for this test
      cy.getByTestId("login-email-input").as("loginEmailInput");
      cy.getByTestId("login-password-input").as("loginPasswordInput");
      cy.getByTestId("login-submit-button").as("loginSubmitButton");

      // Correct email, wrong password
      cy.get("@loginEmailInput").type(testUser.email);
      cy.get("@loginPasswordInput").type("WrongPassword123!");

      // Submit form
      cy.get("@loginSubmitButton").click();

      // Should show error message (alias it after it appears)
      cy.getByTestId("login-error-message").as("loginErrorMessage");
      cy.get("@loginErrorMessage").should(
        "include.text",
        "Invalid credentials",
      );
    });
  });

  it("should have link to register page", () => {
    cy.visitLogin();

    // Alias element for this test
    cy.getByTestId("login-create-account-link").as("loginCreateAccountLink");

    // Should have a link to registration
    cy.get("@loginCreateAccountLink").should("be.visible").click();

    // Should navigate to register page
    cy.url().should("include", "/register");
    cy.getByTestId("register-page-title").should("be.visible");
  });

  it("should have disabled submit button until all fields are filled", () => {
    cy.visitLogin();

    // Button should be disabled when form is empty
    cy.get("@loginSubmitButton").should("be.visible").and("be.disabled");

    // Fill only email - button should still be disabled
    cy.get("@loginEmailInput").type("test@example.com");
    cy.get("@loginSubmitButton").should("be.disabled");

    // Fill password - button should now be enabled
    cy.get("@loginPasswordInput").type("password123");
    cy.get("@loginSubmitButton").should("not.be.disabled");
  });
});
