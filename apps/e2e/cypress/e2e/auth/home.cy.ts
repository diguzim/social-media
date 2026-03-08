import type { TestUser } from "../../support/test-data";

describe("Home Page Flow", () => {
  let testUser: TestUser;

  beforeEach(() => {
    cy.authenticateViaApi({ password: "WelcomePass123!" }).then((user) => {
      testUser = user;

      // Set up aliases for page elements
      cy.getByTestId("home-welcome-title").as("homeWelcomeTitle");
      cy.getByTestId("home-user-email").as("homeUserEmail");
      cy.getByTestId("home-profile-card").as("homeProfileCard");
      cy.getByTestId("feed-section").as("feedSection");
      cy.getByTestId("navbar-menu-button").as("navbarMenuButton");
    });
  });

  it.only("should display welcome page with loading state initially", () => {
    // Page may show loading first, then welcome heading after profile is loaded
    cy.get("@homeWelcomeTitle").should(
      "contain.text",
      `Welcome ${testUser.name}!`,
    );
  });

  it("should fetch and display user profile on welcome page", () => {
    // Should be on home page after programmatic login
    cy.url().should("include", "/");

    // Should display welcome message with user name
    cy.get("@homeWelcomeTitle").should(
      "contain.text",
      `Welcome ${testUser.name}!`,
    );

    // Should display user details
    cy.get("@homeUserEmail").should("contain.text", testUser.email);
  });

  it("should display user information in profile section", () => {
    // Wait for profile fetch
    cy.url().should("include", "/");

    // Should show email (from the fetched profile)
    cy.get("@homeProfileCard").should("be.visible");
    cy.get("@homeUserEmail").should("contain.text", testUser.email);
  });

  it("should display feed section on welcome page", () => {
    // Should show feed section below profile
    cy.get("@feedSection").should("be.visible");
  });

  it("should have Logout button on welcome page", () => {
    // Click navbar menu to reveal logout button
    cy.get("@navbarMenuButton").should("be.visible").click();
    cy.getByTestId("navbar-logout-button").should("be.visible");
  });

  it("should logout and clear tokens when logout button is clicked", () => {
    // Click logout button from navbar dropdown
    cy.get("@navbarMenuButton").click();
    // Alias logout button after clicking the menu
    cy.getByTestId("navbar-logout-button").as("navbarLogoutButton");
    cy.get("@navbarLogoutButton").click();

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
