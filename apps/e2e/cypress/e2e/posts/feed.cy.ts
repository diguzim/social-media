// E2E tests for GET /posts/feed – enriched posts with author info
// Uses Chai assertion style (Cypress built-in)

import { faker } from "@faker-js/faker";
import type { TestUser } from "../../support/test-data";

const API_BASE_URL =
  (Cypress.env("API_BASE_URL") as string | undefined) ??
  "http://localhost:4000";

describe("GET /posts/feed", () => {
  let author: TestUser;
  let jwtToken: string;
  let createdPostId: string;

  before(() => {
    cy.authenticateViaApi().then((user) => {
      author = user;

      cy.window().then((win) => {
        jwtToken = win.localStorage.getItem("jwtToken") ?? "";

        // Create one post via API so the feed has data
        cy.request({
          method: "POST",
          url: `${API_BASE_URL}/posts`,
          headers: { Authorization: `Bearer ${jwtToken}` },
          body: {
            title: `Fake E2E Feed Post ${faker.lorem.words(3)}`,
            content: faker.lorem.paragraph(),
          },
        }).then((res) => {
          createdPostId = res.body.id as string;
        });
      });
    });
  });

  const requestFeed = (query = "") =>
    cy.request({
      method: "GET",
      url: `${API_BASE_URL}/posts/feed${query}`,
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

  it("returns 200 with a paginated response shape", () => {
    requestFeed().then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body).to.have.property("total");
      expect(res.body).to.have.property("page");
      expect(res.body).to.have.property("limit");
      expect(res.body).to.have.property("totalPages");
    });
  });

  it("enriches posts with author name and id", () => {
    requestFeed(`?authorId=${author.id}`).then((res) => {
      expect(res.body.data.length).to.be.greaterThan(0);
      const post = res.body.data[0];
      expect(post).to.have.property("author");
      expect(post.author).to.have.property("id").that.is.a("string");
      expect(post.author).to.have.property("name").that.is.a("string");
      expect(post.author.name).not.to.equal("Unknown User");
      if (post.author.avatarUrl) {
        expect(post.author.avatarUrl).to.match(/\/users\/[^/]+\/avatar$/);
      }
    });
  });

  it("returns a reachable avatar URL when the author has one", () => {
    requestFeed("?limit=20").then((res) => {
      const postWithAvatar = (
        res.body.data as { author: { avatarUrl?: string } }[]
      ).find((post) => Boolean(post.author.avatarUrl));

      if (!postWithAvatar?.author.avatarUrl) {
        return;
      }

      cy.request({
        method: "GET",
        url: postWithAvatar.author.avatarUrl,
      }).then((avatarRes) => {
        expect(avatarRes.status).to.equal(200);
        expect(avatarRes.headers["content-type"]).to.match(/^image\//);
      });
    });
  });

  it("returns author.name matching the registered user", () => {
    requestFeed(`?authorId=${author.id}`).then((res) => {
      expect(res.body.data.length).to.be.greaterThan(0);
      const post = res.body.data.find(
        (p: { id: string }) => p.id === createdPostId,
      );
      expect(post).to.exist;
      expect(post.author.name).to.equal(author.name);
      expect(post.author.id).to.equal(author.id);
    });
  });

  it("respects the limit query param", () => {
    requestFeed("?limit=1").then((res) => {
      expect(res.body.data.length).to.be.lte(1);
      expect(res.body.limit).to.equal(1);
    });
  });

  it("respects the authorId filter", () => {
    requestFeed(`?authorId=${author.id}`).then((res) => {
      expect(res.body.data).to.satisfy((posts: { authorId: string }[]) =>
        posts.every((p) => p.authorId === author.id),
      );
    });
  });

  it("each post has a valid ISO createdAt timestamp", () => {
    requestFeed().then((res) => {
      const posts = res.body.data as { createdAt: string }[];
      posts.forEach((post) => {
        expect(new Date(post.createdAt).toISOString()).to.equal(post.createdAt);
      });
    });
  });
});
