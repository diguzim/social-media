describe("Photos feature", () => {
  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=";

  beforeEach(() => {
    cy.authenticateViaApi({
      name: "Fake E2E Photos Owner",
      username: `fake-e2e-photos-${Date.now()}`,
    }).as("owner");
  });

  it("creates albums and uploads unsorted photos", function () {
    cy.visit("/profile/photos");

    cy.getByTestId("profile-photos-section").should("be.visible");

    cy.getByTestId("profile-photos-album-name-input").type(
      "Fake E2E Travel Album",
    );
    cy.getByTestId("profile-photos-album-description-input").type(
      "Fake E2E photos for coverage",
    );
    cy.getByTestId("profile-photos-create-button").click();

    cy.contains("Fake E2E Travel Album").should("be.visible");

    cy.getByTestId("profile-photos-file-input").selectFile({
      contents: Cypress.Buffer.from(tinyPngBase64, "base64"),
      fileName: "fake-e2e-unsorted.png",
      mimeType: "image/png",
      lastModified: Date.now(),
    });
    cy.getByTestId("profile-photos-photo-description-input").type(
      "Fake E2E Unsorted",
    );
    cy.getByTestId("profile-photos-upload-button").click();

    cy.getByTestId("profile-photos-unsorted-section")
      .find("img")
      .its("length")
      .should("be.greaterThan", 0);
  });

  it("renders uploaded photos on public user profile photos route", function () {
    cy.visit("/profile/photos");

    cy.getByTestId("profile-photos-file-input").selectFile({
      contents: Cypress.Buffer.from(tinyPngBase64, "base64"),
      fileName: "fake-e2e-public.png",
      mimeType: "image/png",
      lastModified: Date.now(),
    });
    cy.getByTestId("profile-photos-photo-description-input").type(
      "Fake E2E Public Photo",
    );
    cy.getByTestId("profile-photos-upload-button").click();

    cy.visit(`/users/${this.owner.username}/photos`);

    cy.getByTestId("user-profile-photos-section").should("be.visible");
    cy.getByTestId("user-profile-photos-unsorted-section")
      .find("img")
      .its("length")
      .should("be.greaterThan", 0);
  });
});

describe("Photos auth regression (alice)", () => {
  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=";

  beforeEach(() => {
    const apiBaseUrl =
      (Cypress.env("API_BASE_URL") as string | undefined) ??
      "http://localhost:4000";

    cy.request({
      method: "POST",
      url: `${apiBaseUrl}/users/login`,
      body: {
        email: "alice@example.com",
        password: "password",
      },
    }).then((loginResponse) => {
      const accessToken = loginResponse.body.accessToken as string;

      cy.request({
        method: "GET",
        url: `${apiBaseUrl}/users/me`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((profileResponse) => {
        cy.visit("/profile/photos", {
          onBeforeLoad(win) {
            win.localStorage.setItem("jwtToken", accessToken);
            win.localStorage.setItem(
              "user",
              JSON.stringify(profileResponse.body),
            );
          },
        });
      });
    });
  });

  it("keeps uploaded photo accessible without auth header and visible after full refresh", () => {
    cy.getByTestId("profile-photos-section").should("be.visible");

    cy.getByTestId("profile-photos-file-input").selectFile({
      contents: Cypress.Buffer.from(tinyPngBase64, "base64"),
      fileName: "fake-e2e-alice-regression.png",
      mimeType: "image/png",
      lastModified: Date.now(),
    });
    cy.getByTestId("profile-photos-photo-description-input").type(
      "Fake E2E Alice Regression",
    );
    cy.getByTestId("profile-photos-upload-button").click();

    cy.getByTestId("profile-photos-unsorted-section")
      .find("img")
      .first()
      .should("be.visible")
      .invoke("attr", "src")
      .then((src) => {
        expect(src).to.be.a("string").and.not.empty;

        cy.request({
          url: src as string,
          failOnStatusCode: false,
          headers: {},
        })
          .its("status")
          .should("eq", 200);
      });

    cy.reload();

    cy.getByTestId("profile-photos-unsorted-section")
      .find("img")
      .its("length")
      .should("be.greaterThan", 0);
  });

  it("loads alice seeded photo scenarios: unsorted, album with photo, and empty album", () => {
    cy.getByTestId("profile-photos-unsorted-section")
      .find("img")
      .its("length")
      .should("be.greaterThan", 0);

    cy.getByTestId("profile-photos-albums-section").within(() => {
      cy.contains("Alice Travel (Seed)").should("be.visible");
      cy.contains("Alice Empty Album (Seed)").should("be.visible");
      cy.get('[data-testid^="profile-photos-album-image-"]')
        .its("length")
        .should("be.greaterThan", 0);
      cy.contains("Album is empty.").should("be.visible");
    });
  });
});
