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

  it("renders own photos route without management controls", function () {
    cy.getByTestId("user-profile-photos-section").should("be.visible");
    cy.getByTestId("user-profile-photos-albums-section").should("be.visible");
    cy.getByTestId("user-profile-photos-unsorted-section").should("be.visible");
    cy.getByTestId("profile-photos-create-button").should("not.exist");
    cy.getByTestId("profile-photos-upload-button").should("not.exist");
  });
});

describe("Photos auth regression (alice)", () => {
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

  it("loads alice seeded photo scenarios: unsorted, album with photo, and empty album", () => {
    cy.getByTestId("user-profile-photos-unsorted-section")
      .find("img")
      .its("length")
      .should("be.greaterThan", 0);

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

    cy.getByTestId("user-profile-photos-selected-album-section").within(() => {
      cy.get('[data-testid^="user-profile-photos-album-image-"]')
        .its("length")
        .should("be.greaterThan", 0);
    });

    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      "Alice Empty Album (Seed)",
    )
      .find('[data-testid^="user-profile-photos-album-card-"]')
      .click();

    cy.getByTestId("user-profile-photos-selected-album-section").within(() => {
      cy.contains("Album is empty.").should("be.visible");
    });
  });

  it("opens selected album photo in modal and closes it", () => {
    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      "Alice Travel (Seed)",
    )
      .find('[data-testid^="user-profile-photos-album-card-"]')
      .click();

    cy.getByTestId("user-profile-photos-selected-album-section")
      .find('[data-testid^="user-profile-photos-album-image-"]')
      .first()
      .click();

    cy.getByTestId("user-profile-photos-modal").should("be.visible");
    cy.getByTestId("user-profile-photos-modal-close-button").click();
    cy.getByTestId("user-profile-photos-modal").should("not.exist");
  });
});
