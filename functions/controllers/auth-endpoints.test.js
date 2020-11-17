const {
  exampleObjectMetadata,
} = require("firebase-functions-test/lib/providers/storage");
const request = require("supertest");

describe("Google functions", () => {
  it("should sign in the user and receive a token", async () => {
    const result = await request(
      "http://localhost:5000/whitelabel-website-8d2ee/europe-west2/api"
    )
      .post("/admin")
      .send({
        email: "test@test.com",
        password: "test1234",
      });

    expect(result.body).toEqual(
      expect.objectContaining({ token: expect.any(String) })
    );
  });

  it("should return correct error if user does not exist", async () => {
    const result = await request(
      "http://localhost:5000/whitelabel-website-8d2ee/europe-west2/api"
    )
      .post("/admin")
      .send({
        email: "test@test.co",
        password: "test1234",
      });

    expect(result.body).toEqual(
      expect.objectContaining({
        error: "User not found",
      })
    );
  });

  it("should return correct error if password is invalid", async () => {
    const result = await request(
      "http://localhost:5000/whitelabel-website-8d2ee/europe-west2/api"
    )
      .post("/admin")
      .send({
        email: "test@test.com",
        password: "test123",
      });

    expect(result.body).toEqual(
      expect.objectContaining({
        error: "Invalid password",
      })
    );
  });

  it("should return correct error if password is invalid", async () => {
    const result = await request(
      "http://localhost:5000/whitelabel-website-8d2ee/europe-west2/api"
    )
      .post("/adminss")
      .send({
        email: "test@test.com",
        password: "test123",
      });

    expect(result.body).toEqual(
      expect.objectContaining({
        error: "Path not found",
      })
    );
  });
});
