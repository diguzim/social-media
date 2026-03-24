// Custom Cypress commands for common test operations
// See: https://docs.cypress.io/api/cypress-api/custom-commands

import { buildTestUser } from "./test-data";
import type { TestUser } from "./test-data";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GetProfileResponse,
} from "@repo/contracts/api";

const INPUT_WAIT_TIMEOUT_MS = 15_000;
const INPUT_RETRY_DELAY_MS = 150;

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Query element(s) by data-testid attribute
       * @param testId - data-testid value
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

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
        username: string;
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
        username: string;
        email: string;
        password: string;
      }): Chainable<void>;

      /**
       * Programmatically authenticate a fresh user via API and bootstrap localStorage
       * Returns the generated test user data for assertions
       */
      authenticateViaApi(overrides?: Partial<TestUser>): Chainable<TestUser>;
    }
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
 * Query element by data-testid
 */
Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

/**
 * Navigate to home page
 */
Cypress.Commands.add("visitHome", () => {
  cy.visit("/");
  cy.url().should("include", "/");
});

/**
 * Navigate to register page
 */
Cypress.Commands.add("visitRegister", () => {
  cy.visit("/register");
  cy.getByTestId("register-page-title").should("be.visible");
});

/**
 * Navigate to login page
 */
Cypress.Commands.add("visitLogin", () => {
  cy.visit("/login");
  cy.getByTestId("login-page-title").should("be.visible");
});

/**
 * Fill and submit registration form
 */
Cypress.Commands.add("registerUser", (user: RegisterRequest) => {
  fillEnabledInput('[data-testid="register-name-input"]', user.name, "name");
  fillEnabledInput(
    '[data-testid="register-username-input"]',
    user.username,
    "username",
  );
  fillEnabledInput('[data-testid="register-email-input"]', user.email, "email");
  fillEnabledInput(
    '[data-testid="register-password-input"]',
    user.password,
    "password",
  );

  cy.getByTestId("register-submit-button")
    .should("be.visible")
    .and("not.be.disabled")
    .click();
});

/**
 * Fill and submit login form
 */
Cypress.Commands.add("loginUser", (email: string, password: string) => {
  fillEnabledInput('[data-testid="login-email-input"]', email, "email");
  fillEnabledInput(
    '[data-testid="login-password-input"]',
    password,
    "password",
  );

  cy.getByTestId("login-submit-button")
    .should("be.visible")
    .and("not.be.disabled")
    .click();
});

/**
 * Register and login in one command
 */
Cypress.Commands.add("registerAndLogin", (user: RegisterRequest) => {
  cy.visitRegister();
  cy.registerUser(user);
  cy.visitLogin();
  cy.loginUser(user.email, user.password);
});

/**
 * Register and login via API (no UI form interaction), then visit home with localStorage
 */
Cypress.Commands.add(
  "authenticateViaApi",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((overrides: Partial<TestUser> = {}) => {
    const testUser = buildTestUser(overrides);
    const apiBaseUrl =
      (Cypress.env("API_BASE_URL") as string | undefined) ??
      "http://localhost:4000";

    return cy
      .request<RegisterResponse>({
        method: "POST",
        url: `${apiBaseUrl}/users`,
        body: {
          name: testUser.name,
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
        } as RegisterRequest,
      })
      .then(() =>
        cy.request<LoginResponse>({
          method: "POST",
          url: `${apiBaseUrl}/users/login`,
          body: {
            email: testUser.email,
            password: testUser.password,
          } as LoginRequest,
        }),
      )
      .then((loginResponse) => {
        const accessToken = loginResponse.body.accessToken;

        return cy
          .request<GetProfileResponse>({
            method: "GET",
            url: `${apiBaseUrl}/users/me`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .then((profileResponse) => {
            const profile = profileResponse.body;

            return cy
              .visit("/", {
                onBeforeLoad(win) {
                  win.localStorage.setItem("jwtToken", accessToken);
                  win.localStorage.setItem("user", JSON.stringify(profile));
                },
              })
              .then(() => cy.wrap({ ...testUser, id: profile.id }));
          });
      });
  }) as any,
);
