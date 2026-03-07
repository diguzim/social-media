describe("User Registration Flow", () => {
  beforeEach(() => {
    cy.visitLogin();
  });

  it("should navigate from login to register page via link click", () => {
    // Verify login page is loaded
    cy.contains("h1", "Login").should("be.visible");

    // Click registration link
    cy.contains("a", "Create one").should("be.visible").click();

    // Should be on register page
    cy.url().should("include", "/register");
    cy.contains("h1", "Register").should("be.visible");
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
    cy.get('input[name="name"]').should("be.visible").type(testUser.name);
    cy.get('input[name="email"]').should("be.visible").type(testUser.email);
    cy.get('input[name="password"]')
      .should("be.visible")
      .type(testUser.password);

    // Submit form
    cy.contains("button", "Register").should("be.visible").click();

    // Should be redirected to login page
    cy.url().should("include", "/login");
    cy.contains("h1", "Login").should("be.visible");
  });

  it("should show error message for empty form submission", () => {
    // Navigate to register page
    cy.visit("/register");

    // Try to submit empty form
    cy.contains("button", "Register").click();

    // Form should still be on register page (HTML5 validation prevents submit)
    cy.url().should("include", "/register");
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
    cy.contains("h1", "Login").should("be.visible");
    cy.contains("a", "Create one").should("be.visible");
  });
});
