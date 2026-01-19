import request from "supertest";
import app from "../app.js";

describe("Invalid route", () => {
  it("should return 404", async () => {
    const res = await request(app).get("/invalid-route");
    expect(res.statusCode).toBe(404);
  });
});
