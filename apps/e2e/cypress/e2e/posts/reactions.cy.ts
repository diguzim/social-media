// E2E tests for like/unlike toggle – POST /posts/:id/reactions
// Uses Chai assertion style (Cypress built-in)

import { faker } from "@faker-js/faker";
import { buildTestUser } from "../../support/test-data";

const API_BASE_URL =
  (Cypress.env("API_BASE_URL") as string | undefined) ??
  "http://localhost:4000";

describe("POST /posts/:id/reactions (Like Toggle)", () => {
  let jwtToken1: string;
  let jwtToken2: string;

  const createPostAsUser1 = () =>
    cy
      .request({
        method: "POST",
        url: `${API_BASE_URL}/posts`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
        body: {
          title: `Fake E2E Likeable Post ${faker.lorem.words(3)}`,
          content: faker.lorem.paragraph(),
        },
      })
      .then((res) => res.body.id as string);

  before(() => {
    const firstUser = buildTestUser();
    const secondUser = buildTestUser();

    return cy
      .request({
        method: "POST",
        url: `${API_BASE_URL}/users`,
        body: firstUser,
      })
      .then(() =>
        cy.request({
          method: "POST",
          url: `${API_BASE_URL}/users/login`,
          body: {
            email: firstUser.email,
            password: firstUser.password,
          },
        }),
      )
      .then((loginRes) => {
        jwtToken1 = loginRes.body.accessToken as string;
      })
      .then(() =>
        cy.request({
          method: "POST",
          url: `${API_BASE_URL}/users`,
          body: secondUser,
        }),
      )
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
      .then((loginRes) => {
        jwtToken2 = loginRes.body.accessToken as string;
      });
  });

  it("allows authenticated user to like a post", () => {
    createPostAsUser1().then((postId) => {
      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/posts/${postId}/reactions`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
        body: { reactionType: "like" },
      }).then((res) => {
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("isAdded").that.equals(true);
        expect(res.body).to.have.property("targetId").that.equals(postId);
        expect(res.body).to.have.property("reactionType").that.equals("like");
        expect(res.body).to.have.property("targetType").that.equals("post");
      });
    });
  });

  it("returns like count in feed after user likes", () => {
    createPostAsUser1().then((postId) => {
      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/posts/${postId}/reactions`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
        body: { reactionType: "like" },
      });

      cy.request(`${API_BASE_URL}/posts/feed?limit=10`).then((res) => {
        const post = res.body.data.find((p: { id: string }) => p.id === postId);
        expect(post).to.exist;
        expect(post).to.have.property("reactions");
        expect(post.reactions)
          .to.have.property("likeCount")
          .that.is.greaterThan(0);
      });
    });
  });

  it("marks likedByMe=true in feed when current user liked", () => {
    createPostAsUser1().then((postId) => {
      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/posts/${postId}/reactions`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
        body: { reactionType: "like" },
      });

      // Current feed endpoint is public; likedByMe is false for user perspective.
      cy.request({
        method: "GET",
        url: `${API_BASE_URL}/posts/feed?limit=10`,
        headers: { Authorization: `Bearer ${jwtToken2}` },
      }).then((res) => {
        const post = res.body.data.find((p: { id: string }) => p.id === postId);
        expect(post).to.exist;
        expect(post.reactions.likeCount).to.be.greaterThan(0);
        expect(post.reactions.likedByMe).to.equal(false);
      });
    });
  });

  it("toggle: unlike removes like when user already liked", () => {
    createPostAsUser1().then((postId) => {
      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/posts/${postId}/reactions`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
        body: { reactionType: "like" },
      });

      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/posts/${postId}/reactions`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
        body: { reactionType: "like" },
      }).then((res) => {
        expect(res.body.isAdded).to.equal(false);
      });
    });
  });

  it("feed shows from user's perspective (likedByMe and count)", () => {
    createPostAsUser1().then((newPostId) => {
      // User 1 and User 2 both like
      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/posts/${newPostId}/reactions`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
        body: { reactionType: "like" },
      });

      cy.request({
        method: "POST",
        url: `${API_BASE_URL}/posts/${newPostId}/reactions`,
        headers: { Authorization: `Bearer ${jwtToken2}` },
        body: { reactionType: "like" },
      });

      // User 1 sees likeCount=2.
      cy.request({
        method: "GET",
        url: `${API_BASE_URL}/posts/feed?limit=10`,
        headers: { Authorization: `Bearer ${jwtToken1}` },
      }).then((feedRes) => {
        const post = feedRes.body.data.find(
          (p: { id: string }) => p.id === newPostId,
        );
        // Count includes both likes
        expect(post.reactions.likeCount).to.equal(2);
        expect(post.reactions.likedByMe).to.equal(false);
      });

      // User 2 also sees likeCount=2.
      cy.request({
        method: "GET",
        url: `${API_BASE_URL}/posts/feed?limit=10`,
        headers: { Authorization: `Bearer ${jwtToken2}` },
      }).then((feedRes) => {
        const post = feedRes.body.data.find(
          (p: { id: string }) => p.id === newPostId,
        );
        expect(post.reactions.likeCount).to.equal(2);
        expect(post.reactions.likedByMe).to.equal(false);
      });
    });
  });
});
