describe("Profile Avatar Upload", () => {
  beforeEach(function () {
    cy.authenticateViaApi({ password: "WelcomePass123!" }).then((user) => {
      cy.wrap(user).as("authenticatedUser");
      cy.visit(`/users/${user.username}`);
    });
  });

  it("renders own profile through /users/:username route", function () {
    cy.getByTestId("user-profile-page").should("be.visible");
    cy.getByTestId("user-profile-card").should("be.visible");
    cy.getByTestId("user-profile-avatar-image").should("be.visible");
    cy.getByTestId("user-profile-username").should(
      "contain.text",
      `@${this.authenticatedUser.username}`,
    );
  });

  it("does not expose own-profile management controls", () => {
    cy.getByTestId("profile-avatar-input").should("not.exist");
    cy.getByTestId("profile-avatar-upload-button").should("not.exist");
    cy.getByTestId("profile-page").should("not.exist");
  });
});
