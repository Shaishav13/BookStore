import request from "supertest";
import app from "../app.js";

describe("GET /book", () => {
  it("should return books", async () => {

    const res = await request(app).get("/book");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
