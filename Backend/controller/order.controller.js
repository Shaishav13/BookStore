// controller/order.controller.js

import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Stripe from "stripe";
import PDFDocument from "pdfkit";
import fs from "fs"; // currently unused, but kept in case you use later
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ⚠️ You should ideally move this secret to process.env.STRIPE_SECRET
const stripe = new Stripe(
  "sk_test_51SNo5JPgn4fVebeOseCJ0qvkWAplYqDFVKgc1ZTX5wGU0V8grsRlDkjF1vA3FGVrHeaXPfRCT7BRX4aLG4Zx97Rf0033TTzfAB"
);

// ========================= CREATE PAYMENT INTENT ========================

const createPaymentIntent = async (req, res) => {
  try {
    const { userId, address } = req.body;

    // basic validation
    if (!userId || !address) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.bookId");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const items = cart.items.map((item) => ({
      bookId: item.bookId._id,
      quantity: item.quantity,
      price: item.bookId.price,
    }));

    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Stripe amounts are in cents (or paise for INR)
      currency: "inr", // Changed to Indian Rupees
      description: `Order for ${userId}`,
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("createPaymentIntent error:", error);
    return res.status(500).json({ message: "Failed to create payment intent" });
  }
};

// ========================= CREATE ORDER ========================

const createOrder = async (req, res) => {
  try {
    const { userId, address, paymentIntentId } = req.body;

    // 👉 This is what your test expects:
    // when body is {}, it should return 400 "Missing fields"
    if (!userId || !address || !paymentIntentId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.bookId");
    if (!cart) {
      // For fake / invalid user / empty cart
      return res.status(404).json({ message: "Cart not found" });
    }

    const items = cart.items.map((item) => ({
      bookId: item.bookId._id,
      quantity: item.quantity,
      price: item.bookId.price,
    }));

    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Confirm the Payment Intent
    // In tests, if you use a fake paymentIntentId, Stripe may throw,
    // but that's fine as long as you're not calling this in that test.
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    const newOrder = new Order({
      userId,
      items,
      totalPrice,
      address,
      status: "Paid",
    });

    await newOrder.save();

    // Clear the cart
    cart.items = [];
    await cart.save();

    // You can return full order or a subset – tests just need consistent shape
    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: error.message || "Order failed" });
  }
};

// ========================= VIEW ORDER(S) ========================

const viewOrder = async (req, res) => {
  const { userId } = req.params;

  try {
    const order = await Order.find({ userId }).populate("items.bookId");

    // Order.find() returns [] when nothing found, never null
    if (!order || order.length === 0) {
      return res.status(404).json({ message: "No Orders Placed Yet" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("viewOrder error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ========================= GENERATE RECEIPT (PDF) ========================

const generateReceipt = async (req, res) => {
  const margin = 50;

  try {
    const _id = req.params.orderId;
    const download = req.query.download === "true";
    console.log(`Generating receipt for order ID: ${_id}`);

    // Populate book details so we can show names and other info
    const order = await Order.findById(_id).populate("items.bookId");

    if (!order) {
      console.error("Order not found");
      return res.status(404).json({ message: "Order not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    const filename = `UB_Books_Order_receipt-${_id}.pdf`;
    if (download) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
    } else {
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    }

    const doc = new PDFDocument({ margin });
    doc.pipe(res);

    // Header
    doc
      .fillColor("#111827")
      .fontSize(26)
      .font("Helvetica-Bold")
      .text("UB Books", {
        align: "left",
      });

    // Right-aligned invoice metadata
    const topY = doc.y - 22;
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#374151")
      .text(`Invoice: ${order._id}`, margin, topY, { align: "right" });
    doc.text(`Date: ${order.createdAt.toDateString()}`, { align: "right" });
    doc.moveDown(0.5);

    // Seller / Buyer block
    doc.moveDown(0.5);
    const leftColX = margin;
    const rightColX = doc.page.width / 2 + 10;

    // Seller info
    doc.fontSize(10).font("Helvetica-Bold").text("From:", leftColX);
    doc.fontSize(10).font("Helvetica").text("UB Books");
    doc.text("123 Book St.");
    doc.text("Booktown, BK 12345");
    doc.text("Email: support@ubbooks.com");

    // Shipping / customer info
    doc.fontSize(10).font("Helvetica-Bold").text("To:", rightColX);
    if (order.address) {
      const addr = order.address;
      const addrLines = [];
      if (addr.name) addrLines.push(addr.name);
      addrLines.push([addr.street, addr.city].filter(Boolean).join(", "));
      addrLines.push([addr.state, addr.zip].filter(Boolean).join(" "));
      if (addr.country) addrLines.push(addr.country);
      addrLines.forEach((ln) => doc.font("Helvetica").text(ln));
    } else {
      doc.font("Helvetica").text("No shipping address provided");
    }

    doc.moveDown();

    // Table header
    const tableTop = doc.y + 8;
    const itemX = margin;
    const descriptionX = itemX + 220;
    const qtyX = descriptionX + 200;
    const priceX = qtyX + 60;
    const lineTotalX = priceX + 70;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Item", itemX, tableTop);
    doc.text("Price", priceX, tableTop, { width: 60, align: "right" });
    doc.text("Qty", qtyX, tableTop, { width: 40, align: "right" });
    doc.text("Total", lineTotalX, tableTop, { width: 80, align: "right" });

    doc
      .moveTo(margin, tableTop + 15)
      .lineTo(doc.page.width - margin, tableTop + 15)
      .strokeColor("#e5e7eb")
      .stroke();
    doc.moveDown(1.2);

    // Items
    let positionY = tableTop + 25;
    let subtotal = 0;
    doc.font("Helvetica").fontSize(10);

    for (const item of order.items) {
      const name = item.bookId?.name || "Unknown Item";
      const desc = item.bookId?.title || "";
      const price = Number(item.price || item.bookId?.price || 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = price * qty;
      subtotal += lineTotal;

      // Wrap name/description in description column
      doc.text(name, itemX, positionY, { width: descriptionX - itemX - 10 });

      // small description under name
      if (desc) {
        doc
          .fontSize(9)
          .fillColor("#6b7280")
          .text(desc, itemX, doc.y, { width: descriptionX - itemX - 10 });
        doc.fillColor("#111827").fontSize(10);
      }

      doc.text(qty.toString(), qtyX, positionY, {
        width: 40,
        align: "right",
      });
      doc.text(`\u20B9${price.toFixed(2)}`, priceX, positionY, {
        width: 60,
        align: "right",
      });
      doc.text(`\u20B9${lineTotal.toFixed(2)}`, lineTotalX, positionY, {
        width: 80,
        align: "right",
      });

      positionY = doc.y + 12;

      // Add page if necessary
      if (positionY > doc.page.height - 100) {
        doc.addPage();
        positionY = margin;
      }
    }

    // Totals
    const tax = 0; // adjust if tax logic exists
    const shipping = 0; // adjust if shipping logic exists
    const total = subtotal + tax + shipping;

    doc
      .moveTo(margin, positionY)
      .lineTo(doc.page.width - margin, positionY)
      .strokeColor("#e5e7eb")
      .stroke();
    doc.moveDown(1);

    const totalsRightX = doc.page.width - margin - 200;
    doc.fontSize(10).font("Helvetica");
    doc.text(`Subtotal:`, totalsRightX, doc.y, { continued: true });
    doc.text(` \u20B9${subtotal.toFixed(2)}`, { align: "right" });
    doc.text(`Tax:`, totalsRightX, doc.y, { continued: true });
    doc.text(` \u20B9${tax.toFixed(2)}`, { align: "right" });
    doc.text(`Shipping:`, totalsRightX, doc.y, { continued: true });
    doc.text(` \u20B9${shipping.toFixed(2)}`, { align: "right" });

    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#ef4444")
      .text(`Total: \u20B9${total.toFixed(2)}`, { align: "right" });

    doc.moveDown(1.5);
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .font("Helvetica")
      .text("Thank you for your purchase!", margin);

    doc.end();
  } catch (error) {
    console.error("Error generating receipt:", error);
    return res.status(500).json({ message: "Error generating receipt" });
  }
};

export { createPaymentIntent, createOrder, viewOrder, generateReceipt };
