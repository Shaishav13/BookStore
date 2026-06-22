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
      payment_method_types: ["card"],
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
      paymentMethod: 'card',
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
  try {
    const _id = req.params.orderId;
    const download = req.query.download === "true";

    const order = await Order.findById(_id).populate("items.bookId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    const filename = `UB_Books_Invoice_${_id}.pdf`;
    res.setHeader(
      "Content-Disposition",
      `${download ? "attachment" : "inline"}; filename="${filename}"`
    );

    // ── Page setup ──────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    doc.pipe(res);

    const PW = doc.page.width;   // 595
    const PH = doc.page.height;  // 842
    const M  = 50;               // content margin

    // ── Brand colours ───────────────────────────────────────────────────
    const PINK    = "#ec4899";
    const DARK    = "#1f2937";
    const MID     = "#6b7280";
    const LIGHT   = "#f9fafb";
    const BORDER  = "#e5e7eb";
    const WHITE   = "#ffffff";
    const GREEN   = "#16a34a";

    // ── Helper: rupee string (avoids encoding issues) ────────────────────
    const rs = (n) => `Rs. ${Number(n).toFixed(2)}`;

    // ════════════════════════════════════════════════════════════════════
    // 1. HEADER BAND
    // ════════════════════════════════════════════════════════════════════
    doc.rect(0, 0, PW, 110).fill(PINK);

    // Brand name
    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(28)
      .text("UB-Books", M, 28);

    // Tagline
    doc
      .fillColor("rgba(255,255,255,0.75)")
      .font("Helvetica")
      .fontSize(10)
      .text("Discover, shop, and read — all in one place.", M, 62);

    // INVOICE label (top-right)
    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("INVOICE", 0, 28, { align: "right", width: PW - M });

    // Invoice number & date (top-right, below label)
    doc
      .fillColor("rgba(255,255,255,0.85)")
      .font("Helvetica")
      .fontSize(9)
      .text(`#${order._id}`, 0, 58, { align: "right", width: PW - M })
      .text(`Date: ${order.createdAt.toDateString()}`, 0, 72, { align: "right", width: PW - M });

    // ════════════════════════════════════════════════════════════════════
    // 2. STATUS BADGE
    // ════════════════════════════════════════════════════════════════════
    const badgeX = PW - M - 80;
    const badgeY = 82;
    doc.roundedRect(badgeX, badgeY, 80, 20, 10).fill(GREEN);
    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("PAID", badgeX, badgeY + 5, { width: 80, align: "center" });

    // ════════════════════════════════════════════════════════════════════
    // 3. FROM / TO BLOCK
    // ════════════════════════════════════════════════════════════════════
    const blockY = 130;
    const colW   = (PW - M * 2) / 2 - 10;

    // FROM box
    doc.roundedRect(M, blockY, colW, 110, 6).fill(LIGHT);
    doc
      .fillColor(PINK)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("FROM", M + 14, blockY + 14);
    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("UB-Books", M + 14, blockY + 30);
    doc
      .fillColor(MID)
      .font("Helvetica")
      .fontSize(9)
      .text("123 Book Street, Booktown", M + 14, blockY + 48)
      .text("BK 12345, India", M + 14, blockY + 62)
      .text("support@ub-books.com", M + 14, blockY + 76)
      .text("GSTIN: 27AABCV1234F1Z5", M + 14, blockY + 90);

    // TO box
    const toX = M + colW + 20;
    doc.roundedRect(toX, blockY, colW, 110, 6).fill(LIGHT);
    doc
      .fillColor(PINK)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("BILL TO", toX + 14, blockY + 14);

    const addr = order.address || {};
    const addrLines = [
      [addr.street, addr.city].filter(Boolean).join(", "),
      [addr.state, addr.zip].filter(Boolean).join(" - "),
      addr.country || "",
    ].filter(Boolean);

    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(addr.name || "Customer", toX + 14, blockY + 30);
    doc
      .fillColor(MID)
      .font("Helvetica")
      .fontSize(9);
    addrLines.forEach((line, i) => {
      doc.text(line, toX + 14, blockY + 48 + i * 14);
    });

    // ════════════════════════════════════════════════════════════════════
    // 4. ITEMS TABLE
    // ════════════════════════════════════════════════════════════════════
    const tableY = blockY + 130;

    // Column X positions
    const col = {
      item:  M,
      qty:   PW - M - 220,
      price: PW - M - 140,
      total: PW - M - 60,
    };

    // Table header row
    doc.rect(M, tableY, PW - M * 2, 28).fill(DARK);
    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("ITEM DESCRIPTION", col.item + 10, tableY + 9)
      .text("QTY",   col.qty,   tableY + 9, { width: 40, align: "center" })
      .text("PRICE", col.price, tableY + 9, { width: 70, align: "right" })
      .text("TOTAL", col.total, tableY + 9, { width: 70, align: "right" });

    // Rows
    let rowY = tableY + 28;
    let subtotal = 0;
    let rowIndex = 0;

    for (const item of order.items) {
      const name  = item.bookId?.name  || "Unknown Item";
      const title = item.bookId?.title || "";
      const price = Number(item.price || item.bookId?.price || 0);
      const qty   = Number(item.quantity || 1);
      const lineTotal = price * qty;
      subtotal += lineTotal;

      // Alternating row background
      if (rowIndex % 2 === 0) {
        doc.rect(M, rowY, PW - M * 2, 44).fill("#fdf2f8");
      } else {
        doc.rect(M, rowY, PW - M * 2, 44).fill(WHITE);
      }

      // Item name
      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(name, col.item + 10, rowY + 8, { width: col.qty - col.item - 20 });

      // Item subtitle
      doc
        .fillColor(MID)
        .font("Helvetica")
        .fontSize(8)
        .text(title, col.item + 10, rowY + 24, { width: col.qty - col.item - 20 });

      // Qty, Price, Total
      doc
        .fillColor(DARK)
        .font("Helvetica")
        .fontSize(10)
        .text(qty.toString(), col.qty, rowY + 14, { width: 40, align: "center" })
        .text(rs(price),      col.price, rowY + 14, { width: 70, align: "right" });

      doc
        .fillColor(PINK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(rs(lineTotal), col.total, rowY + 14, { width: 70, align: "right" });

      // Row bottom border
      doc
        .moveTo(M, rowY + 44)
        .lineTo(PW - M, rowY + 44)
        .strokeColor(BORDER)
        .lineWidth(0.5)
        .stroke();

      rowY += 44;
      rowIndex++;

      if (rowY > PH - 180) {
        doc.addPage();
        rowY = M;
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // 5. TOTALS BLOCK
    // ════════════════════════════════════════════════════════════════════
    const totalsX = PW - M - 220;
    const totalsY = rowY + 16;
    const totalsW = 220;

    doc.rect(totalsX, totalsY, totalsW, 90).fill(LIGHT);

    // Subtotal row
    doc
      .fillColor(MID)
      .font("Helvetica")
      .fontSize(9)
      .text("Subtotal:",  totalsX + 14, totalsY + 14)
      .text("Tax (0%):",  totalsX + 14, totalsY + 32)
      .text("Shipping:",  totalsX + 14, totalsY + 50);

    doc
      .fillColor(DARK)
      .font("Helvetica")
      .fontSize(9)
      .text(rs(subtotal), totalsX + 14, totalsY + 14, { width: totalsW - 28, align: "right" })
      .text(rs(0),        totalsX + 14, totalsY + 32, { width: totalsW - 28, align: "right" })
      .text(rs(0),        totalsX + 14, totalsY + 50, { width: totalsW - 28, align: "right" });

    // Total row — pink band
    doc.rect(totalsX, totalsY + 68, totalsW, 28).fill(PINK);
    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("TOTAL",    totalsX + 14, totalsY + 76)
      .text(rs(subtotal), totalsX + 14, totalsY + 76, { width: totalsW - 28, align: "right" });

    // ════════════════════════════════════════════════════════════════════
    // 6. THANK YOU NOTE
    // ════════════════════════════════════════════════════════════════════
    const noteY = totalsY + 110;
    doc.rect(M, noteY, PW - M * 2, 50).fill("#fdf2f8");
    doc
      .fillColor(PINK)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Thank you for shopping with UB-Books!", M + 14, noteY + 10);
    doc
      .fillColor(MID)
      .font("Helvetica")
      .fontSize(9)
      .text(
        "For any queries, reach us at support@ub-books.com",
        M + 14, noteY + 28
      );

    // ════════════════════════════════════════════════════════════════════
    // 7. FOOTER BAND
    // ════════════════════════════════════════════════════════════════════
    doc.rect(0, PH - 40, PW, 40).fill(DARK);
    doc
      .fillColor("rgba(255,255,255,0.5)")
      .font("Helvetica")
      .fontSize(8)
      .text(
        "UB-Books  |  support@ub-books.com  |  ub-books.com",
        0, PH - 26,
        { align: "center", width: PW }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating receipt:", error);
    return res.status(500).json({ message: "Error generating receipt" });
  }
};

// ========================= CREATE ORDER (UPI - direct) ========================
// UPI via Stripe is only available on live Indian accounts.
// In test/dev mode we simulate the UPI flow: validate UPI ID format,
// then create the order directly without a Stripe payment intent.

const createUpiOrder = async (req, res) => {
  try {
    const { userId, address, upiId } = req.body;

    if (!userId || !address || !upiId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Basic UPI ID format check
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ message: "Invalid UPI ID format" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.bookId");
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart not found or empty" });
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

    const newOrder = new Order({
      userId,
      items,
      totalPrice,
      address,
      paymentMethod: 'upi',
      status: "Paid",
    });

    await newOrder.save();

    cart.items = [];
    await cart.save();

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("createUpiOrder error:", error);
    return res.status(500).json({ message: error.message || "Order failed" });
  }
};

export { createPaymentIntent, createOrder, createUpiOrder, viewOrder, generateReceipt };
