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
        email: "rodrigomarcondes2000@gmail.com",
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

  it("lets the owner create, edit, and delete an album", () => {
    const albumName = `Fake E2E Album ${Date.now()}`;
    const updatedAlbumName = `${albumName} Updated`;

    cy.getByTestId("user-profile-photos-tab-albums").click();

    cy.getByTestId("user-profile-photos-new-album-button").click();
    cy.getByTestId("user-profile-album-name-input").type(albumName);
    cy.getByTestId("user-profile-album-description-input").type(
      "Fake E2E album description",
    );
    cy.getByTestId("user-profile-album-form-submit-button").click();

    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      albumName,
    ).should("be.visible");

    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      albumName,
    ).within(() => {
      cy.get('[data-testid^="user-profile-photos-album-actions-trigger-"]')
        .first()
        .click();
    });

    cy.get('[data-testid^="user-profile-photos-album-edit-action-"]')
      .first()
      .click();

    cy.getByTestId("user-profile-album-name-input")
      .clear()
      .type(updatedAlbumName);
    cy.getByTestId("user-profile-album-form-submit-button").click();

    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      updatedAlbumName,
    )
      .should("be.visible")
      .within(() => {
        cy.get('[data-testid^="user-profile-photos-album-actions-trigger-"]')
          .first()
          .click();
      });

    cy.get('[data-testid^="user-profile-photos-album-delete-action-"]')
      .first()
      .click();

    cy.getByTestId("user-profile-album-delete-confirm-button").click();
    cy.contains(
      'article[data-testid^="user-profile-photos-album-"]',
      updatedAlbumName,
    ).should("not.exist");
  });

  it("lets the owner upload to unsorted and delete from photo actions", () => {
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=";

    cy.getByTestId("user-profile-photos-tab-unsorted").click();

    cy.get('[data-testid^="user-profile-photos-unsorted-image-"]').then(
      ($images) => {
        const initialCount = $images.length;

        cy.getByTestId("user-profile-photos-upload-unsorted-button").click();
        cy.getByTestId("user-profile-photos-upload-input").selectFile(
          {
            contents: Cypress.Buffer.from(pngBase64, "base64"),
            fileName: `fake-e2e-photo-${Date.now()}.png`,
            mimeType: "image/png",
            lastModified: Date.now(),
          },
          { force: true },
        );

        cy.get('[data-testid^="user-profile-photos-unsorted-image-"]').should(
          "have.length.greaterThan",
          initialCount,
        );
      },
    );

    cy.get('[data-testid^="user-profile-photo-actions-trigger-"]')
      .first()
      .click();
    cy.get('[data-testid^="user-profile-photo-delete-action-"]')
      .first()
      .click();
    cy.getByTestId("user-profile-photo-delete-confirm-button").click();
    cy.getByTestId("user-profile-photo-delete-modal").should("not.exist");
  });
});
