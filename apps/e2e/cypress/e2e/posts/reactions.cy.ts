// E2E tests for like/unlike toggle – POST /posts/:id/reactions
// Uses Chai assertion style (Cypress built-in)

import { faker } from "@faker-js/faker";
import type { TestUser } from "../../support/test-data";

const API_BASE_URL =
  (Cypress.env("API_BASE_URL") as string | undefined) ??
  "http://localhost:4000";

describe("POST /posts/:id/reactions (Like Toggle)", () => {
  let user1: TestUser;
  let user2: TestUser;
  let jwtToken1: string;
  let jwtToken2: string;
  let postId: string;

  before(() => {
    // First user creates a post
    cy.authenticateViaApi().then((user) => {
      user1 = user;

      cy.window().then((win) => {
        jwtToken1 = win.localStorage.getItem("jwtToken") ?? "";

        // Create a post
        cy.request({
          method: "POST",
          url: `${API_BASE_URL}/posts`,
          headers: { Authorization: `Bearer ${jwtToken1}` },
          body: {
            title: `Fake E2E Likeable Post ${faker.lorem.words(3)}`,
            content: faker.lorem.paragraph(),
          },
        }).then((res) => {
          postId = res.body.id as string;
        });
      });
    });

    // Second user authenticates for separate like action
    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/auth/register`,
      body: {
        email: `fakee2e+${faker.internet.exampleEmail()}`,
        password: faker.internet.password({ length: 12 }),
      },
    }).then((res) => {
      user2 = res.body as TestUser;
      cy.window().then((win) => {
        jwtToken2 = res.body.token as string;
        win.localStorage.setItem("jwtToken", jwtToken2);
      });
    });
  });

  it("allows authenticated user to like a post", () => {
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

  it("returns like count in feed after user likes", () => {
    // User 1 likes the post
    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/posts/${postId}/reactions`,
      headers: { Authorization: `Bearer ${jwtToken1}` },
      body: { reactionType: "like" },
    });

    // Check feed includes reaction info
    cy.request(`${API_BASE_URL}/posts/feed?limit=10`).then((res) => {
      const post = res.body.data.find((p: { id: string }) => p.id === postId);
      expect(post).to.exist;
      expect(post).to.have.property("reactions");
      expect(post.reactions)
        .to.have.property("likeCount")
        .that.is.greaterThan(0);
    });
  });

  it("marks likedByMe=true in feed when current user liked", () => {
    // User 1 likes post
    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/posts/${postId}/reactions`,
      headers: { Authorization: `Bearer ${jwtToken1}` },
      body: { reactionType: "like" },
    });

    // User 2 checks feed – should show user1's like but not theirs
    cy.request(`${API_BASE_URL}/posts/feed?limit=10`, {
      headers: { Authorization: `Bearer ${jwtToken2}` },
    }).then((res) => {
      const post = res.body.data.find((p: { id: string }) => p.id === postId);
      expect(post).to.exist;
      expect(post.reactions.likeCount).to.be.greaterThan(0);
      expect(post.reactions.likedByMe).to.equal(false);
    });
  });

  it("toggle: unlike removes like when user already liked", () => {
    // User 1 likes post
    const likeRes = cy.request({
      method: "POST",
      url: `${API_BASE_URL}/posts/${postId}/reactions`,
      headers: { Authorization: `Bearer ${jwtToken1}` },
      body: { reactionType: "like" },
    });

    // User 1 likes again (toggle = unlike)
    cy.wrap(likeRes).then(() => {
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
    cy.request({
      method: "POST",
      url: `${API_BASE_URL}/posts`,
      headers: { Authorization: `Bearer ${jwtToken1}` },
      body: {
        title: `Fake E2E Multi-Like Post ${faker.lorem.words(3)}`,
        content: faker.lorem.paragraph(),
      },
    }).then((res) => {
      const newPostId = res.body.id as string;

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

      // User 1 sees likeCount=2, likedByMe=true
      cy.request(`${API_BASE_URL}/posts/feed?limit=10`, {
        headers: { Authorization: `Bearer ${jwtToken1}` },
      }).then((feedRes) => {
        const post = feedRes.body.data.find(
          (p: { id: string }) => p.id === newPostId,
        );
        // Count includes both likes
        expect(post.reactions.likeCount).to.equal(2);
        expect(post.reactions.likedByMe).to.equal(true);
      });

      // User 2 sees likeCount=2, likedByMe=true (from their perspective)
      cy.request(`${API_BASE_URL}/posts/feed?limit=10`, {
        headers: { Authorization: `Bearer ${jwtToken2}` },
      }).then((feedRes) => {
        const post = feedRes.body.data.find(
          (p: { id: string }) => p.id === newPostId,
        );
        expect(post.reactions.likeCount).to.equal(2);
        expect(post.reactions.likedByMe).to.equal(true);
      });
    });
  });
});
