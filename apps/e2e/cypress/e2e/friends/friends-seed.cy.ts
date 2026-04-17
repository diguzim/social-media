const API_BASE_URL =
  (Cypress.env("API_BASE_URL") as string | undefined) ??
  "http://localhost:4000";

describe("Friendship seed data", () => {
  let jwtToken = "";

  before(() => {
    cy.request<{ accessToken: string }>({
      method: "POST",
      url: `${API_BASE_URL}/users/login`,
      body: {
        email: "rodrigomarcondes2000@gmail.com",
        password: "password",
      },
    }).then((response) => {
      jwtToken = response.body.accessToken;
    });
  });

  it("keeps alice with at least one friend and one pending request", () => {
    cy.request({
      method: "GET",
      url: `${API_BASE_URL}/friends`,
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }).then((friendsResponse) => {
      expect(friendsResponse.status).to.equal(200);
      expect(friendsResponse.body.data).to.be.an("array");
      expect(friendsResponse.body.data.length).to.be.greaterThan(0);

      const usernames = (
        friendsResponse.body.data as Array<{ username: string }>
      ).map((friend) => friend.username);
      expect(usernames).to.include("bob");
    });

    const getPendingRequests = (path: string) =>
      cy.request({
        method: "GET",
        url: `${API_BASE_URL}${path}`,
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

    getPendingRequests("/friends/requests/incoming").then(
      (incomingResponse) => {
        expect(incomingResponse.status).to.equal(200);
        expect(incomingResponse.body.data).to.be.an("array");
        const hasCharlie = (
          incomingResponse.body.data as Array<{
            requester: { username: string };
          }>
        ).some((request) => request.requester.username === "charlie");
        expect(hasCharlie).to.equal(true);
      },
    );

    getPendingRequests("/friends/requests/outgoing").then(
      (outgoingResponse) => {
        expect(outgoingResponse.status).to.equal(200);
        expect(outgoingResponse.body.data).to.be.an("array");
        const hasDiana = (
          outgoingResponse.body.data as Array<{
            recipient: { username: string };
          }>
        ).some((request) => request.recipient.username === "diana");
        expect(hasDiana).to.equal(true);
      },
    );
  });
});
