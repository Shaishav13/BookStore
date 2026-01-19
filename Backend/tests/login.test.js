import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";

describe("POST /user/login", () => {

  beforeAll(async () => {
    await request(app)
      .post("/user/signup")
      .send({
        name: "Test User",
        email: "testuser@test.com",
        password: "123456",
      });
  });

  it("should login the user successfully", async () => {
    const res = await request(app)
      .post("/user/login")
      .send({
        email: "testuser@test.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("_id");
    expect(res.body.user.email).toBe("testuser@test.com");
    expect(res.body.message).toMatch(/success/i);
  });

  it("should reject invalid password", async () => {
    const res = await request(app)
      .post("/user/login")
      .send({
        email: "testuser@test.com",
        password: "wrong",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should reject unknown email", async () => {
    const res = await request(app)
      .post("/user/login")
      .send({
        email: "noone@test.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
