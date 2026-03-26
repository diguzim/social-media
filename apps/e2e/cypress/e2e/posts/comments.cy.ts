import { faker } from "@faker-js/faker";
import { buildTestUser } from "../../support/test-data";

const API_BASE_URL =
  (Cypress.env("API_BASE_URL") as string | undefined) ??
  "http://localhost:4000";

describe("Post comments", () => {
  let currentUserToken: string;
  let postId: string;

  const createPostForCurrentUser = (jwtToken: string) => {
    const title = `Fake E2E Comments Post ${faker.lorem.words(3)}`;
    const content = faker.lorem.paragraph();

    return cy
      .request({
        method: "POST",
        url: `${API_BASE_URL}/posts`,
        headers: { Authorization: `Bearer ${jwtToken}` },
        body: { title, content },
      })
      .then((response) => {
        postId = response.body.id as string;
      });
  };

  const openCommentsForCurrentPost = () => {
    cy.getByTestId(`post-card-${postId}`).should("be.visible");
    cy.getByTestId(`comments-open-${postId}`).click();
    cy.getByTestId(`comment-input-${postId}`).should("be.visible");
  };

  beforeEach(() => {
    cy.authenticateViaApi({ password: "CommentsE2E123!" }).then(() =>
      cy.window().then((win) => {
        currentUserToken = win.localStorage.getItem("jwtToken") ?? "";
        return createPostForCurrentUser(currentUserToken).then(() => {
          cy.visit("/");
        });
      }),
    );
  });

  it("allows creating, editing and deleting own comment on Home feed", () => {
    const originalComment = `Fake E2E Comment ${faker.lorem.words(4)}`;
    const updatedComment = `Fake E2E Updated Comment ${faker.lorem.words(4)}`;

    openCommentsForCurrentPost();

    cy.getByTestId(`comments-empty-${postId}`).should("be.visible");

    cy.getByTestId(`comment-input-${postId}`).type(originalComment);
    cy.getByTestId(`comment-submit-${postId}`).click();

    cy.getByTestId(`comments-list-${postId}`)
      .should("contain.text", originalComment)
      .within(() => {
        cy.get(`[data-testid^="comment-edit-${postId}-"]`)
          .should("have.length", 1)
          .click();
      });

    cy.get(`[data-testid^="comment-edit-input-${postId}-"]`)
      .should("have.length", 1)
      .clear()
      .type(updatedComment);
    cy.get(`[data-testid^="comment-edit-save-${postId}-"]`)
      .should("have.length", 1)
      .click();

    cy.getByTestId(`comments-list-${postId}`)
      .should("contain.text", updatedComment)
      .within(() => {
        cy.get(`[data-testid^="comment-delete-${postId}-"]`)
          .should("have.length", 1)
          .click();
      });

    cy.getByTestId(`comments-empty-${postId}`).should("be.visible");
    cy.getByTestId(`comments-list-${postId}`).should("not.exist");
  });

  it("shows comments on My Posts and only allows owner actions for own comments", () => {
    const ownComment = `Fake E2E MyPosts Comment ${faker.lorem.words(4)}`;
    const otherComment = `Fake E2E Foreign Comment ${faker.lorem.words(4)}`;

    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/posts/${postId}/comments`,
      headers: { Authorization: `Bearer ${currentUserToken}` },
      body: { content: ownComment },
    });

    const secondUser = buildTestUser();
    let secondUserToken = "";

    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/users`,
      body: secondUser,
    })
      .then(() =>
        cy.request({
          method: "POST",
          url: `${API_BASE_URL}/users/login`,
          body: {
            email: secondUser.email,
            password: secondUser.password,
          },
        }),
      )
      .then((loginResponse) => {
        secondUserToken = loginResponse.body.accessToken as string;
      })
      .then(() =>
        cy.request({
          method: "POST",
          url: `${API_BASE_URL}/posts/${postId}/comments`,
          headers: { Authorization: `Bearer ${secondUserToken}` },
          body: { content: otherComment },
        }),
      );

    cy.getByTestId("navbar-my-posts-link").click();
    cy.getByTestId("my-posts-page").should("be.visible");

    openCommentsForCurrentPost();

    cy.getByTestId(`comments-list-${postId}`)
      .should("contain.text", ownComment)
      .and("contain.text", otherComment)
      .within(() => {
        cy.get(`[data-testid^="comment-edit-${postId}-"]`).should(
          "have.length",
          1,
        );
        cy.get(`[data-testid^="comment-delete-${postId}-"]`).should(
          "have.length",
          1,
        );
      });

    cy.contains(ownComment).should("be.visible");
    cy.contains(otherComment).should("be.visible");
    cy.get(`[data-testid^="comment-item-${postId}-"]`).should("have.length", 2);

    cy.getByTestId(`comments-close-${postId}`).click();
    cy.getByTestId(`comment-input-${postId}`).should("not.exist");
  });
});
