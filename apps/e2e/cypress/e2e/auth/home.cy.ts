describe("Home Page Flow", () => {
  beforeEach(() => {
    cy.authenticateViaApi({ password: "WelcomePass123!" }).then(() => {
      cy.getByTestId("home-page").as("homePage");
      cy.getByTestId("home-create-post-section").as("homeCreatePostSection");
      cy.getByTestId("home-feed-section").as("homeFeedSection");
      cy.getByTestId("feed-section").as("feedSection");
      cy.getByTestId("navbar-menu-button").as("navbarMenuButton");
    });
  });

  it("should display home page islands", () => {
    cy.get("@homePage").should("be.visible");
    cy.get("@homeCreatePostSection").should("be.visible");
    cy.get("@homeFeedSection").should("be.visible");
  });

  it("should stay on home page after programmatic authentication", () => {
    cy.url().should("include", "/");
  });

  it("should display feed section on welcome page", () => {
    // Should show feed section below profile
    cy.get("@feedSection").should("be.visible");
  });

  it("should have Logout button on welcome page", () => {
    // Click navbar menu to reveal logout button
    cy.get("@navbarMenuButton").should("be.visible").click();
    cy.getByTestId("navbar-account-settings-link").should("be.visible");
    cy.getByTestId("navbar-logout-button").should("be.visible");
  });

  it("should open account settings from navbar menu", () => {
    cy.get("@navbarMenuButton").click();
    cy.getByTestId("navbar-account-settings-link").click();

    cy.url().should("include", "/account/personal-data");
    cy.getByTestId("account-settings-page").should("be.visible");
    cy.getByTestId("account-settings-navigation").should("be.visible");
    cy.getByTestId("account-settings-personal-data").should("be.visible");
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
