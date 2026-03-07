describe("User Registration Flow", () => {
  beforeEach(() => {
    cy.visitLogin();
  });

  it("should navigate from login to register page via link click", () => {
    // Verify login page is loaded
    cy.getByTestId("login-page-title").should("be.visible");

    // Click registration link
    cy.getByTestId("login-create-account-link").should("be.visible").click();

    // Should be on register page
    cy.url().should("include", "/register");
    cy.getByTestId("register-page-title").should("be.visible");
  });

  it("should successfully register a new user", () => {
    // Navigate to register page
    cy.visit("/register");

    // Test data
    const testUser = {
      name: `Test User ${Date.now()}`,
      email: `test+${Date.now()}@example.com`,
      password: "TestPassword123!",
    };

    // Fill registration form
    cy.getByTestId("register-name-input")
      .should("be.visible")
      .type(testUser.name);
    cy.getByTestId("register-email-input")
      .should("be.visible")
      .type(testUser.email);
    cy.getByTestId("register-password-input")
      .should("be.visible")
      .type(testUser.password);

    // Submit form
    cy.getByTestId("register-submit-button").should("be.visible").click();

    // Should be redirected to login page
    cy.url().should("include", "/login");
    cy.getByTestId("login-page-title").should("be.visible");
  });

  it("should have disabled submit button until all fields are filled", () => {
    // Navigate to register page
    cy.visit("/register");

    // Button should be disabled when form is empty
    cy.getByTestId("register-submit-button")
      .should("be.visible")
      .and("be.disabled");

    // Fill only name - button should still be disabled
    cy.getByTestId("register-name-input").type("Test User");
    cy.getByTestId("register-submit-button").should("be.disabled");

    // Fill email - button should still be disabled
    cy.getByTestId("register-email-input").type("test@example.com");
    cy.getByTestId("register-submit-button").should("be.disabled");

    // Fill password - button should now be enabled
    cy.getByTestId("register-password-input").type("password123");
    cy.getByTestId("register-submit-button").should("not.be.disabled");
  });

  it("should fill, submit, and verify user is on login page after registration", () => {
    // Use the custom command to register a user
    cy.visitRegister();

    const testUser = {
      name: `User ${Date.now()}`,
      email: `user+${Date.now()}@example.com`,
      password: "SecurePass123!",
    };

    cy.registerUser(testUser);

    // Verify redirected to login
    cy.url().should("include", "/login");
    cy.getByTestId("login-page-title").should("be.visible");
    cy.getByTestId("login-create-account-link").should("be.visible");
  });
});
