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

  it("opens own-profile avatar actions, previews image in modal and triggers native file picker flow", () => {
    cy.intercept("POST", "**/users/avatar").as("uploadAvatar");
    cy.intercept("GET", "**/users/*/avatar*").as("avatarImage");

    cy.getByTestId("user-profile-avatar-image")
      .invoke("attr", "src")
      .then((initialAvatarSrc) => {
        cy.wrap(initialAvatarSrc).as("initialAvatarSrc");
      });

    cy.getByTestId("user-profile-avatar-trigger").click();
    cy.getByTestId("user-profile-avatar-actions-menu").should("be.visible");
    cy.getByTestId("user-profile-avatar-see-image-action").should("be.visible");
    cy.getByTestId("user-profile-avatar-change-image-action").should(
      "be.visible",
    );

    cy.getByTestId("user-profile-avatar-see-image-action").click();
    cy.getByTestId("user-profile-avatar-modal").should("be.visible");
    cy.getByTestId("user-profile-avatar-modal-image").should("be.visible");
    cy.getByTestId("user-profile-avatar-modal-close-button").click();
    cy.getByTestId("user-profile-avatar-modal").should("not.exist");

    cy.getByTestId("user-profile-avatar-trigger").click();
    cy.getByTestId("user-profile-avatar-change-image-action").click();

    cy.getByTestId("user-profile-avatar-file-input").selectFile(
      "../image-service/avatar-128.png",
      { force: true },
    );

    cy.wait("@uploadAvatar")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    cy.wait("@avatarImage");

    cy.getByTestId("user-profile-avatar-image")
      .invoke("attr", "src")
      .then((updatedAvatarSrc) => {
        cy.get("@initialAvatarSrc").then((initialAvatarSrc) => {
          expect(updatedAvatarSrc).to.not.equal(initialAvatarSrc);
        });

        expect(updatedAvatarSrc).to.match(/(^blob:)|([?&]v=\d+)/);
      })
      .should("not.be.empty");

    cy.getByTestId("user-profile-avatar-upload-error").should("not.exist");
  });
});
