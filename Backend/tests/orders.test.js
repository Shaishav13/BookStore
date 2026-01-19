import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";

let mongo;

// ================= TEST DB SETUP ===================
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.disconnect();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await Cart.deleteMany({});
  await Order.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// ================= TESTS ===========================

describe("POST /order/create", () => {
  it("should return 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/order/create")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Missing fields");
  });

  it("should return 404 when cart not found", async () => {
    const userId = new mongoose.Types.ObjectId(); // valid ID

    const res = await request(app)
      .post("/order/create")
      .send({
        userId,
        address: "Test Ave",
        paymentIntentId: "pi_123"
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Cart not found");
  });
});



describe("GET /order/view/:userId", () => {
  it("should return 404 when no orders exist", async () => {
    const userId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/order/view/${userId.toString()}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No Orders Placed Yet");
  });

 

});
