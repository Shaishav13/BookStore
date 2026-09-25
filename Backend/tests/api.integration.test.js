import request from "supertest";
import app from "../app.js";

describe("API Integration Tests", () => {
  // Test 1: User Registration
  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/user/signup")
      .send({
        name: "Test User",
        email: "testuser_" + Date.now() + "@example.com",
        password: "password123"
      });

    // Depending on the implementation, signup could return 200 or 201
    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/created|successful/i);
  });

  // Test 2: Fetch Books
  it("should retrieve a list of books", async () => {
    const res = await request(app).get("/book");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  // Test 3: Fetch Book Categories
  it("should retrieve book categories", async () => {
    const res = await request(app).get("/book/categories");
    expect(res.statusCode).toBe(200);
    // Even if empty, it should be an array
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
