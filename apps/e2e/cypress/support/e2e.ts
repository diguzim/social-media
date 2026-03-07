// Cypress global hooks and configuration
// See: https://docs.cypress.io/api/plugins/writing-a-plugin

import "./commands";

// Disable uncaught exception handling for test reliability
Cypress.on("uncaught:exception", (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  if (err.message.includes("Script error")) {
    return false;
  }
  // Let other errors fail the test normally
  return true;
});

// Preserve localStorage and sessionStorage across tests
before(() => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

afterEach(() => {
  // Clear localStorage after each test for test isolation
  cy.window().then((win) => {
    // Save token if test expects to persist (optional)
    const token = win.localStorage.getItem("jwtToken");
    win.localStorage.clear();
    if (token) {
      win.localStorage.setItem("jwtToken", token);
    }
  });
});
