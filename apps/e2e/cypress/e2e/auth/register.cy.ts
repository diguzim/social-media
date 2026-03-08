import { buildTestUser } from "../../support/test-data";

describe("User Registration Flow", () => {
  beforeEach(() => {
    cy.visitLogin();
    // Alias login page elements (guaranteed to exist)
    cy.getByTestId("login-create-account-link").as("loginCreateAccountLink");
    cy.getByTestId("login-page-title").as("loginPageTitle");
  });

  it("should navigate from login to register page via link click", () => {
    // Verify login page is loaded
    cy.get("@loginPageTitle").should("be.visible");

    // Click registration link
    cy.get("@loginCreateAccountLink").should("be.visible").click();

    // Should be on register page
    cy.url().should("include", "/register");
    cy.getByTestId("register-page-title").as("registerPageTitle");
    cy.get("@registerPageTitle").should("be.visible");
  });

  it("should successfully register a new user", () => {
    // Navigate to register page
    cy.visit("/register");

    // Test data
    const testUser = buildTestUser({ password: "TestPassword123!" });

    // Alias register page elements
    cy.getByTestId("register-name-input").as("registerNameInput");
    cy.getByTestId("register-email-input").as("registerEmailInput");
    cy.getByTestId("register-password-input").as("registerPasswordInput");
    cy.getByTestId("register-submit-button").as("registerSubmitButton");

    // Fill registration form
    cy.get("@registerNameInput").should("be.visible").type(testUser.name);
    cy.get("@registerEmailInput").should("be.visible").type(testUser.email);
    cy.get("@registerPasswordInput")
      .should("be.visible")
      .type(testUser.password);

    // Submit form
    cy.get("@registerSubmitButton").should("be.visible").click();

    // Should be redirected to login page
    cy.url().should("include", "/login");
    cy.get("@loginPageTitle").should("be.visible");
  });

  it("should have disabled submit button until all fields are filled", () => {
    // Navigate to register page
    cy.visit("/register");

    // Alias register page elements after navigating
    cy.getByTestId("register-name-input").as("registerNameInput");
    cy.getByTestId("register-email-input").as("registerEmailInput");
    cy.getByTestId("register-password-input").as("registerPasswordInput");
    cy.getByTestId("register-submit-button").as("registerSubmitButton");

    // Button should be disabled when form is empty
    cy.getByTestId("register-submit-button")
      .should("be.visible")
      .and("be.disabled");

    // Fill only name - button should still be disabled
    cy.get("@registerNameInput").type(buildTestUser().name);
    cy.get("@registerSubmitButton").should("be.disabled");

    // Fill email - button should still be disabled
    cy.get("@registerEmailInput").type(buildTestUser().email);
    cy.get("@registerSubmitButton").should("be.disabled");

    // Fill password - button should now be enabled
    cy.get("@registerPasswordInput").type("password123");
    cy.get("@registerSubmitButton").should("not.be.disabled");
  });

  it("should fill, submit, and verify user is on login page after registration", () => {
    // Use the custom command to register a user
    cy.visitRegister();

    const testUser = buildTestUser({ password: "SecurePass123!" });

    cy.registerUser(testUser);

    // Verify redirected to login
    cy.url().should("include", "/login");
    cy.get("@loginPageTitle").should("be.visible");
    cy.get("@loginCreateAccountLink").should("be.visible");
  });
});
