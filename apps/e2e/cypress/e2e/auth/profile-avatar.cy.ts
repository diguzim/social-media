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

    cy.getByTestId("profile-avatar-image")
      .invoke("attr", "src")
      .then((avatarUrl) => {
        expect(avatarUrl, "avatarUrl").to.be.a("string").and.not.be.empty;

        cy.request({
          url: avatarUrl as string,
          encoding: "binary",
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers["content-type"]).to.match(
            /^image\/(png|jpeg)/,
          );
          expect(response.body.length).to.be.greaterThan(0);
        });
      });

    cy.reload();

    cy.getByTestId("profile-avatar-image")
      .should("have.attr", "src")
      .and("include", "/users/")
      .and("include", "/avatar");

    cy.getByTestId("profile-avatar-image")
      .invoke("attr", "src")
      .then((avatarUrl) => {
        expect(avatarUrl, "avatarUrl").to.be.a("string").and.not.be.empty;

        cy.request({
          url: avatarUrl as string,
          encoding: "binary",
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.headers["content-type"]).to.match(
            /^image\/(png|jpeg)/,
          );
          expect(response.body.length).to.be.greaterThan(0);
        });
      });
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
