import request from "supertest";
import app from "../app.js";

describe("POST /user/login", () => {
  // create user first
  beforeAll(async () => {
    await request(app)
      .post("/user/signup")
      .send({
        name: "Login User",
        email: "loginuser@example.com",
        password: "123456"
      });
  });

  it("should login the user", async () => {
    const res = await request(app)
      .post("/user/login")
      .send({
        email: "loginuser@example.com",
        password: "123456"
      });

    // success
    expect(res.statusCode).toBe(200);

    // correct message
    expect(res.body).toHaveProperty("message", "Login successful");

    // correct structure
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("_id");
    expect(res.body.user).toHaveProperty("email", "loginuser@example.com");
  });
});
