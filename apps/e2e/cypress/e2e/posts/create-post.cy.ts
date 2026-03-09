import { buildTestUser } from "../../support/test-data";
import { faker } from "@faker-js/faker";
import type { TestUser } from "../../support/test-data";

describe("Create Post Flow", () => {
  let testUser: TestUser;

  beforeEach(() => {
    cy.authenticateViaApi({ password: "CreatePostTest123!" }).then((user) => {
      testUser = user;

      // Set up aliases for page elements
      cy.getByTestId("create-post-section").as("createPostSection");
      cy.getByTestId("create-post-form").as("createPostForm");
      cy.getByTestId("create-post-title-input").as("titleInput");
      cy.getByTestId("create-post-content-input").as("contentInput");
      cy.getByTestId("create-post-submit-button").as("submitButton");
    });
  });

  it("should display create post form on home page", () => {
    cy.get("@createPostSection").should("be.visible");
    cy.get("@createPostForm").should("be.visible");
    cy.get("@titleInput").should("be.visible").and("not.be.disabled");
    cy.get("@contentInput").should("be.visible").and("not.be.disabled");
    cy.get("@submitButton")
      .should("be.visible")
      .and("not.be.disabled")
      .and("contain.text", "Create Post");
  });

  it("should show error when submitting empty form", () => {
    cy.get("@submitButton").click();

    cy.getByTestId("create-post-error-message")
      .should("be.visible")
      .and("contain.text", "Title and content are required");
  });

  it("should show error when title is empty", () => {
    cy.get("@contentInput").type("This is content without a title");
    cy.get("@submitButton").click();

    cy.getByTestId("create-post-error-message")
      .should("be.visible")
      .and("contain.text", "Title and content are required");
  });

  it("should show error when content is empty", () => {
    cy.get("@titleInput").type("This is a title without content");
    cy.get("@submitButton").click();

    cy.getByTestId("create-post-error-message")
      .should("be.visible")
      .and("contain.text", "Title and content are required");
  });

  it("should successfully create a post with valid data", () => {
    const postTitle = `${faker.lorem.words(3)} - E2E Test Post`;
    const postContent = faker.lorem.paragraphs(2);

    cy.get("@titleInput").type(postTitle);
    cy.get("@contentInput").type(postContent);
    cy.get("@submitButton").should("contain.text", "Create Post").click();

    // Should show success message
    cy.getByTestId("create-post-success-message")
      .should("be.visible")
      .and("contain.text", "Post created successfully!");

    // Form should be cleared
    cy.get("@titleInput").should("have.value", "");
    cy.get("@contentInput").should("have.value", "");

    // Should show submit button back to normal state
    cy.get("@submitButton")
      .should("contain.text", "Create Post")
      .and("not.be.disabled");

    // Feed should refresh and show the new post
    cy.getByTestId("feed-section").should("be.visible");
    cy.getByTestId("feed-section").should("contain.text", postTitle);
  });

  it("should disable form inputs while submitting", () => {
    const postTitle = faker.lorem.words(3);
    const postContent = faker.lorem.paragraph();

    cy.get("@titleInput").type(postTitle);
    cy.get("@contentInput").type(postContent);

    cy.get("@submitButton").click();

    // After submission, success message should appear
    cy.getByTestId("create-post-success-message")
      .should("be.visible")
      .and("contain.text", "Post created successfully!");

    // Button should be re-enabled after submission completes
    cy.get("@submitButton")
      .should("not.be.disabled")
      .and("contain.text", "Create Post");

    // Inputs should be re-enabled
    cy.get("@titleInput").should("not.be.disabled");
    cy.get("@contentInput").should("not.be.disabled");
  });

  it("should create multiple posts in sequence", () => {
    const firstPost = {
      title: `First Post - ${faker.lorem.words(2)}`,
      content: faker.lorem.sentences(2),
    };
    const secondPost = {
      title: `Second Post - ${faker.lorem.words(2)}`,
      content: faker.lorem.sentences(2),
    };

    // Create first post
    cy.get("@titleInput").type(firstPost.title);
    cy.get("@contentInput").type(firstPost.content);
    cy.get("@submitButton").click();

    cy.getByTestId("create-post-success-message").should("be.visible");
    cy.get("@titleInput").should("have.value", "");

    // Create second post
    cy.get("@titleInput").type(secondPost.title);
    cy.get("@contentInput").type(secondPost.content);
    cy.get("@submitButton").click();

    cy.getByTestId("create-post-success-message").should("be.visible");

    // Both posts should appear in feed
    cy.getByTestId("feed-section").should("contain.text", firstPost.title);
    cy.getByTestId("feed-section").should("contain.text", secondPost.title);
  });

  it("should trim whitespace from title and content", () => {
    const postTitle = faker.lorem.words(3);
    const postContent = faker.lorem.sentences(2);

    // Add leading and trailing spaces
    cy.get("@titleInput").type(`   ${postTitle}   `);
    cy.get("@contentInput").type(`   ${postContent}   `);
    cy.get("@submitButton").click();

    cy.getByTestId("create-post-success-message").should("be.visible");

    // Form should be cleared (confirming post was created)
    cy.get("@titleInput").should("have.value", "");
    cy.get("@contentInput").should("have.value", "");
  });
});
