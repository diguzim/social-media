describe("Photos feature", () => {
  beforeEach(function () {
    cy.authenticateViaApi({
      name: "Fake E2E Photos Owner",
      username: `fake-e2e-photos-${Date.now()}`,
    }).then((owner) => {
      cy.wrap(owner).as("owner");
      cy.visit(`/users/${owner.username}/photos`);
    });
  });

  it("redirects the base photos route to the unsorted tab", function () {
    cy.location("pathname").should("include", "/photos/unsorted");
    cy.getByTestId("user-profile-photos-tabs").should("be.visible");
    cy.getByTestId("user-profile-photos-tab-unsorted").should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.getByTestId("user-profile-photos-section").should("be.visible");
    cy.getByTestId("user-profile-photos-unsorted-section").should("be.visible");
  });
});

describe("Photos nested navigation (alice)", () => {
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
        cy.visit(`/users/${profileResponse.body.username}/photos`, {
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

  it("shows unsorted photos under the unsorted tab", () => {
    cy.getByTestId("user-profile-photos-tab-unsorted").should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.getByTestId("user-profile-photos-unsorted-section")
      .find("img")
      .its("length")
      .should("be.greaterThan", 0);
  });

  it("navigates to albums and opens an album detail page", () => {
    cy.getByTestId("user-profile-photos-tab-albums").click();

    cy.location("pathname").should("include", "/photos/albums");
    cy.getByTestId("user-profile-photos-tab-albums").should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.getByTestId("user-profile-photos-albums-section").within(() => {
      cy.contains("Alice Travel (Seed)").should("be.visible");
      cy.contains("Alice Empty Album (Seed)").should("be.visible");
    });

    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      "Alice Travel (Seed)",
    )
      .find('[data-testid^="user-profile-photos-album-card-"]')
      .click();

    cy.location("pathname").should("include", "/photos/albums/");
    cy.getByTestId("user-profile-photos-album-detail-section").within(() => {
      cy.get('[data-testid^="user-profile-photos-album-image-"]')
        .its("length")
        .should("be.greaterThan", 0);
    });

    cy.getByTestId("user-profile-photos-album-back-button").click();
    cy.getByTestId("user-profile-photos-albums-section").should("be.visible");
  });

  it("can open an album photo in the modal and close it", () => {
    cy.getByTestId("user-profile-photos-tab-albums").click();

    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      "Alice Travel (Seed)",
    )
      .find('[data-testid^="user-profile-photos-album-card-"]')
      .click();

    cy.getByTestId("user-profile-photos-album-detail-section")
      .find('[data-testid^="user-profile-photos-album-image-"]')
      .first()
      .click();

    cy.getByTestId("photo-modal").should("be.visible");
    cy.getByTestId("photo-modal-close-button").click();
    cy.getByTestId("photo-modal").should("not.exist");
  });
});
