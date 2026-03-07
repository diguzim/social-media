describe("User Login Flow", () => {
  beforeEach(() => {
    // Seed a test user via registration before each test
    // In production, you might use an API call to seed data
    cy.visit("/register");

    const testUser = {
      name: "Test User",
      email: `testuser+${Date.now()}@example.com`,
      password: "TestPass123!",
    };

    // Store in window for use in test
    cy.window().then((win) => {
      (win as any).testUser = testUser;
    });

    cy.registerUser(testUser);

    // Dismiss alert
    cy.on("window:alert", () => {});

    // Should redirect to login
    cy.url().should("include", "/login");
  });

  it("should successfully login with valid credentials", () => {
    cy.window().then((win) => {
      const testUser = (win as any).testUser;

      // Fill login form
      cy.get('input[name="email"]').should("be.visible").type(testUser.email);
      cy.get('input[name="password"]')
        .should("be.visible")
        .type(testUser.password);

      // Submit form
      cy.contains("button", "Login").should("be.visible").click();

      // Should be redirected to home page
      cy.contains("h1", `Welcome ${testUser.name}!`).should("be.visible");
    });
  });

  it("should show error for invalid email", () => {
    cy.visit("/login");

    // Enter invalid credentials
    cy.get('input[name="email"]').type("nonexistent@example.com");
    cy.get('input[name="password"]').type("WrongPassword123!");

    // Submit form
    cy.contains("button", "Login").click();

    // Should show error message
    cy.get("div").should("include.text", "Invalid credentials");
  });

  it("should show error for wrong password", () => {
    cy.window().then((win) => {
      const testUser = (win as any).testUser;

      cy.visit("/login");

      // Correct email, wrong password
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type("WrongPassword123!");

      // Submit form
      cy.contains("button", "Login").click();

      // Should show error message
      cy.get("div").should("include.text", "Invalid credentials");
    });
  });

  it("should have link to register page", () => {
    cy.visit("/login");

    // Should have a link to registration
    cy.contains("a", "Create one").should("be.visible").click();

    // Should navigate to register page
    cy.url().should("include", "/register");
    cy.contains("h1", "Register").should("be.visible");
  });
});
