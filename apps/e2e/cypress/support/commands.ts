// Custom Cypress commands for common test operations
// See: https://docs.cypress.io/api/cypress-api/custom-commands

const INPUT_WAIT_TIMEOUT_MS = 15_000;
const INPUT_RETRY_DELAY_MS = 150;

declare namespace Cypress {
  interface Chainable {
    /**
     * Navigate to home page and verify it's loaded
     */
    visitHome(): Chainable<Window>;

    /**
     * Navigate to register page and verify it's loaded
     */
    visitRegister(): Chainable<Window>;

    /**
     * Navigate to login page and verify it's loaded
     */
    visitLogin(): Chainable<Window>;

    /**
     * Register a new user via the form
     * @param user - Object with name, email, password
     */
    registerUser(user: {
      name: string;
      email: string;
      password: string;
    }): Chainable<void>;

    /**
     * Login a user via the form
     * @param email - User email
     * @param password - User password
     */
    loginUser(email: string, password: string): Chainable<void>;

    /**
     * Register and login a user in one command
     * @param user - Object with name, email, password
     */
    registerAndLogin(user: {
      name: string;
      email: string;
      password: string;
    }): Chainable<void>;
  }
}

function fillEnabledInput(
  selector: string,
  value: string,
  fieldLabel: string,
): Cypress.Chainable<JQuery<HTMLElement>> {
  cy.get(selector, { timeout: INPUT_WAIT_TIMEOUT_MS })
    .should("be.visible")
    .and("have.length", 1)
    .should("not.be.disabled");

  // Small buffer for async state flips on slow CI/electron runs.
  cy.wait(INPUT_RETRY_DELAY_MS);

  return cy
    .get(selector, { timeout: INPUT_WAIT_TIMEOUT_MS })
    .should("be.visible")
    .and("have.length", 1)
    .should("not.be.disabled")
    .then(($input) => {
      if ($input.is(":disabled")) {
        throw new Error(
          `[register/login] ${fieldLabel} input (${selector}) is unexpectedly disabled before typing.`,
        );
      }

      return cy.wrap($input).clear().type(value, { delay: 10 });
    });
}

/**
 * Navigate to home page
 */
Cypress.Commands.add("visitHome", () => {
  cy.visit("/");
  cy.contains("h1").should("include.text", "Welcome");
});

/**
 * Navigate to register page
 */
Cypress.Commands.add("visitRegister", () => {
  cy.visit("/register");
  cy.contains("h1", "Register").should("be.visible");
});

/**
 * Navigate to login page
 */
Cypress.Commands.add("visitLogin", () => {
  cy.visit("/login");
  cy.contains("h1", "Login").should("be.visible");
});

/**
 * Fill and submit registration form
 */
Cypress.Commands.add(
  "registerUser",
  (user: { name: string; email: string; password: string }) => {
    fillEnabledInput('input[name="name"]', user.name, "name");
    fillEnabledInput('input[name="email"]', user.email, "email");
    fillEnabledInput('input[name="password"]', user.password, "password");

    cy.contains("button", "Register")
      .should("be.visible")
      .and("not.be.disabled")
      .click();
  },
);

/**
 * Fill and submit login form
 */
Cypress.Commands.add("loginUser", (email: string, password: string) => {
  fillEnabledInput('input[name="email"]', email, "email");
  fillEnabledInput('input[name="password"]', password, "password");

  cy.contains("button", "Login")
    .should("be.visible")
    .and("not.be.disabled")
    .click();
});

/**
 * Register and login in one command
 */
Cypress.Commands.add(
  "registerAndLogin",
  (user: { name: string; email: string; password: string }) => {
    cy.visitRegister();
    cy.registerUser(user);
    // After registration, should be redirected to login and show alert
    cy.on("window:alert", (str) => {
      expect(str).to.include("Registration successful");
    });
    cy.visitLogin();
    cy.loginUser(user.email, user.password);
  },
);
