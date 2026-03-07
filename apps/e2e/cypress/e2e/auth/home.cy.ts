describe("Home Page Flow", () => {
  const runId = `${Date.now()}-${Cypress._.random(1000, 9999)}`;
  const testUser = {
    name: `Test User ${runId}`,
    email: `testuser+${runId}@example.com`,
    password: "WelcomePass123!",
  };

  before(() => {
    // Register once per spec execution
    cy.visitRegister();
    cy.registerUser(testUser);

    // App redirects to login after successful registration
    cy.url().should("include", "/login");
  });

  beforeEach(() => {
    // Reuse existing registered user
    cy.visitLogin();
    cy.loginUser(testUser.email, testUser.password);

    // Wait for redirect to home page
    cy.url().should("include", "/");
  });

  it("should display welcome page with loading state initially", () => {
    cy.visitHome();

    // Page may show loading first, then welcome heading after profile is loaded
    cy.getByTestId("home-welcome-title").should(
      "contain.text",
      `Welcome ${testUser.name}!`,
    );
  });

  it("should fetch and display user profile on welcome page", () => {
    // Should be on home page after login
    cy.url().should("include", "/");

    // Should display welcome message with user name
    cy.getByTestId("home-welcome-title").should(
      "contain.text",
      `Welcome ${testUser.name}!`,
    );

    // Should display user details
    cy.getByTestId("home-user-email").should("contain.text", testUser.email);
  });

  it("should display user information in profile section", () => {
    // Wait for profile fetch
    cy.url().should("include", "/");

    // Should show email (from the fetched profile)
    cy.getByTestId("home-profile-card").should("be.visible");
    cy.getByTestId("home-user-email").should("contain.text", testUser.email);
  });

  it("should have Logout button on welcome page", () => {
    cy.getByTestId("home-logout-button").should("be.visible");
    cy.getByTestId("navbar-menu-button").should("be.visible");
  });

  it("should logout and clear tokens when logout button is clicked", () => {
    // Click logout button from navbar dropdown
    cy.getByTestId("navbar-menu-button").click();
    cy.getByTestId("navbar-logout-button").click();

    // Should be redirected to login page
    cy.url().should("include", "/login");

    // Token should be cleared from localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem("jwtToken")).to.be.null;
      expect(win.localStorage.getItem("user")).to.be.null;
    });
  });

  it("should redirect to login if no token is present", () => {
    // Clear localStorage to simulate no auth
    cy.window().then((win) => {
      win.localStorage.clear();
    });

    // Reload page so Home component checks for token on mount
    cy.reload();

    // Should redirect to login (Home component checks token in useEffect)
    cy.url({ timeout: 5000 }).should("include", "/login");
  });
});
