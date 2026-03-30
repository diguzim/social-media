describe("Profile Avatar Upload", () => {
  beforeEach(() => {
    cy.authenticateViaApi({ password: "WelcomePass123!" });
    cy.visit("/profile");
  });

  it("uploads and displays a profile avatar", () => {
    const tinyPngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=";

    const fileContent = Cypress.Buffer.from(tinyPngBase64, "base64");

    cy.getByTestId("profile-avatar-input").selectFile(
      {
        contents: fileContent,
        fileName: "avatar.png",
        mimeType: "image/png",
      },
      { force: true },
    );

    cy.getByTestId("profile-avatar-upload-button").click();

    cy.getByTestId("profile-avatar-image")
      .should("have.attr", "src")
      .and("include", "/users/")
      .and("include", "/avatar");

    cy.reload();

    cy.getByTestId("profile-avatar-image")
      .should("have.attr", "src")
      .and("include", "/users/")
      .and("include", "/avatar");
  });

  it("rejects unsupported file types on client validation", () => {
    const fakeGif = Cypress.Buffer.from("474946383961", "hex");

    cy.getByTestId("profile-avatar-input").selectFile(
      {
        contents: fakeGif,
        fileName: "avatar.gif",
        mimeType: "image/gif",
      },
      { force: true },
    );

    cy.getByTestId("profile-avatar-error").should(
      "contain.text",
      "Only JPG and PNG images are allowed.",
    );

    cy.getByTestId("profile-avatar-upload-button").should("be.disabled");
  });
});
