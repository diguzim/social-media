describe("Email verification page", () => {
  it("submits a confirmation request only once per page load", () => {
    cy.intercept("POST", "**/users/email-verification/confirm", {
      statusCode: 200,
      body: {
        status: "verified",
        emailVerifiedAt: new Date().toISOString(),
      },
    }).as("confirmEmail");

    cy.visit("/verify-email?token=first-time-token");

    cy.wait("@confirmEmail");
    cy.getByTestId("verify-email-success-title").should("be.visible");

    cy.get("@confirmEmail.all").then((calls) => {
      expect(calls, "confirm endpoint calls").to.have.length(1);
    });
  });

  it("shows a clear error when token is missing and does not call API", () => {
    cy.intercept("POST", "**/users/email-verification/confirm").as(
      "confirmEmail",
    );

    cy.visit("/verify-email");

    cy.getByTestId("verify-email-error-title").should("be.visible");
    cy.getByTestId("verify-email-error-message").should(
      "contain.text",
      "No verification token found in the URL.",
    );

    cy.get("@confirmEmail.all").then((calls) => {
      expect(calls, "confirm endpoint calls").to.have.length(0);
    });
  });
});
