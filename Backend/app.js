import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import bookRoute from "./routes/book.route.js";
import userRoute from "./routes/user.route.js";
import contactRoute from "./routes/contact.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";

const app = express();
app.use(cors());
app.use(express.json());

// 👇 IMPORTANT: only connect to db IF not testing
if (process.env.NODE_ENV !== "test") {
  const URI = process.env.URI;
  mongoose
    .connect(URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("DB error:", err));
}

app.use("/book", bookRoute);
app.use("/user", userRoute);
app.use("/contact", contactRoute);
app.use("/cart", cartRoute);
app.use("/order", orderRoute);

export default app;
