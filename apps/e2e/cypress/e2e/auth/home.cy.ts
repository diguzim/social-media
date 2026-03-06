describe("Home Page Flow", () => {
  const runId = `${Date.now()}-${Cypress._.random(1000, 9999)}`;
  const testUser = {
    name: `Welcome Test User ${runId}`,
    email: `welcome+${runId}@example.com`,
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

    // Should show loading or page title
    cy.contains("h1").should("include.text", "Welcome");
  });

  it("should fetch and display user profile on welcome page", () => {
    // Should be on home page after login
    cy.url().should("include", "/");

    // Should display welcome message with user name
    cy.contains("h1").should("include.text", "Welcome");

    // Should display user details
    cy.get("body").should("contain", testUser.email);
  });

  it("should display user information in profile section", () => {
    // Wait for profile fetch
    cy.url().should("include", "/");

    // Should show email (from the fetched profile)
    cy.get("p").should("include.text", testUser.email);

    // Should show at least the name label or content
    cy.contains("strong", "Email:").should("be.visible");
  });

  it("should have Logout button on welcome page", () => {
    cy.contains("button", "Logout").should("be.visible");
  });

  it("should logout and clear tokens when logout button is clicked", () => {
    // Click logout button
    cy.contains("button", "Logout").click();

    // Should be redirected to login page
    cy.url().should("include", "/login");

    // Token should be cleared from localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.be.null;
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
