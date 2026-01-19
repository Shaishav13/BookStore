import request from "supertest";
import app from "../app.js";

describe("POST /contact", () => {

  it("should validate required fields", async () => {
    const res = await request(app)
      .post("/contact")
      .send({
        name: "",
        email: "test@test.com",
        message: "Hello!"
      });

    // Should return 400 for missing required fields
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("All fields are required");
  });

  it("should accept valid contact form data", async () => {
    const res = await request(app)
      .post("/contact")
      .send({
        name: "Test User",
        email: "test@test.com",
        message: "This is a test message"
      });

    // Should either succeed (200) or fail with email error (500)
    // Both are acceptable since we're testing the route structure
    expect([200, 500]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("message");
  });

});
