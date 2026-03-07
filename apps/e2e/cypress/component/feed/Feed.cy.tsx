import { createElement } from "react";
import { Feed } from "../../../../user-portal/src/components/feed/Feed";

describe("Feed component", () => {
  it("shows loading state while fetching posts", () => {
    cy.intercept("GET", "http://localhost:4000/posts*", {
      statusCode: 200,
      delay: 1000,
      fixture: "feed.fixture.json",
    }).as("getPosts");

    cy.mount(createElement(Feed));

    cy.getByTestId("feed-loading-state").should("be.visible");

    cy.wait("@getPosts");
    cy.getByTestId("feed-section").should("be.visible");
  });

  it("shows error state when request fails", () => {
    cy.intercept("GET", "http://localhost:4000/posts*", {
      statusCode: 500,
      body: {
        message: "Internal server error",
      },
    }).as("getPosts");

    cy.mount(createElement(Feed));

    cy.wait("@getPosts");
    cy.getByTestId("feed-error-state").should("be.visible");
    cy.contains("Failed to fetch posts").should("be.visible");
  });

  it("shows empty state when API returns no posts", () => {
    cy.intercept("GET", "http://localhost:4000/posts*", {
      statusCode: 200,
      body: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    }).as("getPosts");

    cy.mount(createElement(Feed));

    cy.wait("@getPosts");
    cy.getByTestId("feed-empty-state").should("be.visible");
    cy.contains("No posts yet.").should("be.visible");
  });

  it("shows success state and requests posts with expected query params", () => {
    cy.intercept("GET", "http://localhost:4000/posts*", {
      statusCode: 200,
      fixture: "feed.fixture.json",
    }).as("getPosts");

    cy.mount(createElement(Feed));

    cy.wait("@getPosts").then((interception) => {
      expect(interception.request.query).to.deep.equal({
        limit: "10",
        page: "1",
        sortOrder: "desc",
      });
    });

    cy.getByTestId("feed-section").should("be.visible");
    cy.getByTestId("post-card-post-1").should("be.visible");
    cy.getByTestId("post-title-post-1").should("contain.text", "First post");
    cy.getByTestId("post-card-post-2").should("be.visible");
    cy.getByTestId("post-title-post-2").should("contain.text", "Second post");
  });
});
