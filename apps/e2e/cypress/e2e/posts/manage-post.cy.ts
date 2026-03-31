import { faker } from "@faker-js/faker";

describe("Manage Post Flow", () => {
  const makeImageFile = (name: string, color: "red" | "blue" = "red") => {
    const base64ByColor: Record<"red" | "blue", string> = {
      red: "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8DQwMDAwMDEAAUAFMABnS0k9wAAAABJRU5ErkJggg==",
      blue: "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNkYGD4z0AEYBxVSFIAAAJRAQH4S6x9AAAAAElFTkSuQmCC",
    };

    return {
      contents: Cypress.Buffer.from(base64ByColor[color], "base64"),
      fileName: name,
      mimeType: "image/png",
      lastModified: Date.now(),
    };
  };

  beforeEach(() => {
    cy.authenticateViaApi({ password: "ManagePostTest123!" });
  });

  it("edits title/content and manages images on Home with single save", () => {
    const originalTitle = `Fake E2E Original ${faker.lorem.words(3)}`;
    const originalContent = `Fake E2E Original content ${faker.lorem.sentence()}`;
    const updatedTitle = `Fake E2E Updated ${faker.lorem.words(3)}`;
    const updatedContent = `Fake E2E Updated content ${faker.lorem.sentence()}`;

    cy.getByTestId("create-post-title-input").type(originalTitle);
    cy.getByTestId("create-post-content-input").type(originalContent);
    cy.getByTestId("create-post-images-input").selectFile([
      makeImageFile("fake-e2e-home-1.png", "red"),
      makeImageFile("fake-e2e-home-2.png", "blue"),
    ]);
    cy.getByTestId("create-post-submit-button").click();
    cy.getByTestId("create-post-success-message").should("be.visible");

    cy.contains('[data-testid^="post-title-"]', originalTitle)
      .should("be.visible")
      .invoke("attr", "data-testid")
      .then((titleTestId) => {
        const postId = String(titleTestId).replace("post-title-", "");
        cy.getByTestId(`post-card-${postId}`).as("postCard");
      });

    cy.get("@postCard").within(() => {
      cy.contains("button", "Edit").click();

      cy.get('input[data-testid^="post-edit-title-input-"]')
        .clear()
        .type(updatedTitle);
      cy.get('textarea[data-testid^="post-edit-content-input-"]')
        .clear()
        .type(updatedContent);

      cy.get('input[data-testid^="post-edit-images-input-"]').selectFile(
        makeImageFile("fake-e2e-home-3.png", "red"),
      );

      cy.get('[data-testid^="post-edit-image-item-"]').should(
        "have.length.gte",
        3,
      );

      cy.get('[data-testid^="post-edit-image-item-"]')
        .eq(0)
        .trigger("dragstart", { dataTransfer: new DataTransfer() });
      cy.get('[data-testid^="post-edit-image-item-"]')
        .eq(1)
        .trigger("dragover", { dataTransfer: new DataTransfer() })
        .trigger("drop", { dataTransfer: new DataTransfer() });

      cy.get('[data-testid^="post-edit-image-remove-"]').first().click();
      cy.get('[data-testid^="post-edit-image-item-"]').should(
        "have.length.gte",
        2,
      );

      cy.get('[data-testid^="post-save-"]').click();
    });

    cy.contains('[data-testid^="post-title-"]', updatedTitle).should(
      "be.visible",
    );
    cy.contains('[data-testid^="post-content-"]', updatedContent).should(
      "be.visible",
    );
    cy.get('[data-testid^="post-images-"]').should("be.visible");
  });

  it("edits and deletes a post from My Posts", () => {
    const initialTitle = `Fake E2E MyPosts ${faker.lorem.words(2)}`;
    const initialContent = `Fake E2E MyPosts content ${faker.lorem.sentence()}`;
    const finalTitle = `Fake E2E MyPosts Updated ${faker.lorem.words(2)}`;

    cy.getByTestId("create-post-title-input").type(initialTitle);
    cy.getByTestId("create-post-content-input").type(initialContent);
    cy.getByTestId("create-post-submit-button").click();
    cy.getByTestId("create-post-success-message").should("be.visible");

    cy.getByTestId("navbar-my-posts-link").click();
    cy.getByTestId("my-posts-page").should("be.visible");

    cy.contains('[data-testid^="post-title-"]', initialTitle)
      .should("be.visible")
      .invoke("attr", "data-testid")
      .then((titleTestId) => {
        const postId = String(titleTestId).replace("post-title-", "");
        cy.getByTestId(`post-card-${postId}`).as("myPostCard");
      });

    cy.get("@myPostCard").within(() => {
      cy.contains("button", "Edit").click();
      cy.get('input[data-testid^="post-edit-title-input-"]')
        .clear()
        .type(finalTitle);
      cy.get('[data-testid^="post-save-"]').click();
    });

    cy.contains('[data-testid^="post-title-"]', finalTitle).should(
      "be.visible",
    );

    cy.on("window:confirm", () => true);

    cy.contains('[data-testid^="post-title-"]', finalTitle)
      .should("be.visible")
      .invoke("attr", "data-testid")
      .then((titleTestId) => {
        const postId = String(titleTestId).replace("post-title-", "");
        cy.getByTestId(`post-card-${postId}`).within(() => {
          cy.contains("button", "Delete").click();
        });

        cy.contains('[data-testid^="post-title-"]', finalTitle).should(
          "not.exist",
        );
      });
  });
});
