import request from "supertest";
import app from "../app.js";

describe("POST /cart/create", () => {
  it("should fail when missing userId", async () => {
    const res = await request(app)
      .post("/cart/create")
      .send({
        bookId: "123",
        quantity: 1
      });

    expect(res.statusCode).toBe(500);
  });
});
