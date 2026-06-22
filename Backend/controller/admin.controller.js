import User from "../models/user.model.js";
import Book from "../models/book.model.js";
import Order from "../models/order.model.js";
import EBook from "../models/ebook.model.js";
import EBookOrder from "../models/ebookorder.model.js";
import Review from "../models/review.model.js";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";

// ================= DASHBOARD STATS =================

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalBooks, totalEBooks, totalEBookOrders, revenueResult, ebookRevenueResult] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Book.countDocuments(),
      EBook.countDocuments(),
      EBookOrder.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      EBookOrder.aggregate([{ $group: { _id: null, total: { $sum: "$price" } } }]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalEBookRevenue = ebookRevenueResult[0]?.total || 0;

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "userId", model: "user", select: "name email" })
      .lean();

    const recentEBookOrders = await EBookOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "userId", model: "user", select: "name email" })
      .populate({ path: "ebookId", model: "ebook", select: "name" })
      .lean();

    return res.status(200).json({
      totalUsers, totalOrders, totalBooks, totalEBooks, totalEBookOrders,
      totalRevenue, totalEBookRevenue, ordersByStatus, recentOrders, recentEBookOrders,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= MONTHLY REVENUE CHART =================

export const getMonthlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1); // last 12 months

    const physicalRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: start }, status: { $nin: ["Cancelled"] } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const ebookRevenue = await EBookOrder.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$price" },
          orders: { $sum: 1 },
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Build 12-month labels
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) });
    }

    const data = months.map(m => {
      const ph = physicalRevenue.find(r => r._id.year === m.year && r._id.month === m.month);
      const eb = ebookRevenue.find(r => r._id.year === m.year && r._id.month === m.month);
      return {
        month: m.label,
        books: ph?.revenue || 0,
        ebooks: eb?.revenue || 0,
        total: (ph?.revenue || 0) + (eb?.revenue || 0),
        orders: (ph?.orders || 0) + (eb?.orders || 0),
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Monthly Revenue Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= USERS MANAGEMENT =================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ date: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "Role updated", user });
  } catch (error) {
    console.error("Update Role Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= BOOKS MANAGEMENT =================

export const getAllBooksAdmin = async (req, res) => {
  try {
    const books = await Book.find().sort({ _id: -1 });
    return res.status(200).json({ books });
  } catch (error) {
    console.error("Get All Books Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createBookAdmin = async (req, res) => {
  try {
    const { name, price, category, image, title } = req.body;
    if (!name || !price || !category || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const book = await Book.create({ name, price, category, image, title });
    return res.status(201).json({ message: "Book created", book });
  } catch (error) {
    console.error("Create Book Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBookAdmin = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { name, price, category, image, title } = req.body;
    const book = await Book.findByIdAndUpdate(bookId, { name, price, category, image, title }, { new: true });
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json({ message: "Book updated", book });
  } catch (error) {
    console.error("Update Book Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBookAdmin = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findByIdAndDelete(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete Book Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= FEATURED TOGGLE =================

export const toggleBookFeatured = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    book.featured = !book.featured;
    await book.save();
    return res.status(200).json({ message: `Book ${book.featured ? "featured" : "unfeatured"}`, book });
  } catch (error) {
    console.error("Toggle Featured Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleEBookFeatured = async (req, res) => {
  try {
    const { ebookId } = req.params;
    const ebook = await EBook.findById(ebookId);
    if (!ebook) return res.status(404).json({ message: "EBook not found" });
    ebook.featured = !ebook.featured;
    await ebook.save();
    return res.status(200).json({ message: `EBook ${ebook.featured ? "featured" : "unfeatured"}`, ebook });
  } catch (error) {
    console.error("Toggle EBook Featured Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= BULK UPLOAD BOOKS (CSV) =================

export const bulkUploadBooks = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No CSV file uploaded" });

    const books = [];
    const errors = [];
    let rowIndex = 0;

    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString());
      stream
        .pipe(csvParser())
        .on("data", (row) => {
          rowIndex++;
          const name = row.name || row.Name;
          const price = row.price || row.Price;
          const category = row.category || row.Category;
          const image = row.image || row.Image || "";
          const title = row.title || row.Title || "";
          if (!name || !price || !category) {
            errors.push(`Row ${rowIndex}: Missing required fields (name, price, category)`);
          } else {
            books.push({ name, price: Number(price), category, image, title });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (books.length === 0) {
      return res.status(400).json({ message: "No valid books found in CSV", errors });
    }

    const created = await Book.insertMany(books);
    return res.status(201).json({
      message: `Successfully uploaded ${created.length} books`,
      created: created.length,
      skipped: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= EBOOKS MANAGEMENT =================

export const getAllEBooksAdmin = async (req, res) => {
  try {
    const ebooks = await EBook.find().sort({ _id: -1 });
    return res.status(200).json({ ebooks });
  } catch (error) {
    console.error("Get All EBooks Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createEBookAdmin = async (req, res) => {
  try {
    const { name, author, title, price, category, image, pdfUrl, pages, language } = req.body;
    if (!name || !author || !price || !category || !image || !pdfUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const ebook = await EBook.create({ name, author, title, price, category, image, pdfUrl, pages: pages || 0, language: language || "English" });
    return res.status(201).json({ message: "EBook created", ebook });
  } catch (error) {
    console.error("Create EBook Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateEBookAdmin = async (req, res) => {
  try {
    const { ebookId } = req.params;
    const { name, author, title, price, category, image, pdfUrl, pages, language } = req.body;
    const ebook = await EBook.findByIdAndUpdate(ebookId, { name, author, title, price, category, image, pdfUrl, pages, language }, { new: true });
    if (!ebook) return res.status(404).json({ message: "EBook not found" });
    return res.status(200).json({ message: "EBook updated", ebook });
  } catch (error) {
    console.error("Update EBook Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEBookAdmin = async (req, res) => {
  try {
    const { ebookId } = req.params;
    const ebook = await EBook.findByIdAndDelete(ebookId);
    if (!ebook) return res.status(404).json({ message: "EBook not found" });
    return res.status(200).json({ message: "EBook deleted successfully" });
  } catch (error) {
    console.error("Delete EBook Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= STOCK TOGGLE =================

export const toggleBookStock = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    book.inStock = !book.inStock;
    await book.save();
    return res.status(200).json({ message: `Book marked as ${book.inStock ? "In Stock" : "Out of Stock"}`, book });
  } catch (error) {
    console.error("Toggle Book Stock Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleEBookStock = async (req, res) => {
  try {
    const { ebookId } = req.params;
    const ebook = await EBook.findById(ebookId);
    if (!ebook) return res.status(404).json({ message: "EBook not found" });
    ebook.inStock = !ebook.inStock;
    await ebook.save();
    return res.status(200).json({ message: `EBook marked as ${ebook.inStock ? "In Stock" : "Out of Stock"}`, ebook });
  } catch (error) {
    console.error("Toggle EBook Stock Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= ALL ORDERS (Admin) =================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: "userId", model: "user", select: "name email" })
      .populate("items.bookId", "name image price")
      .lean();
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowed = ["Pending", "Paid", "Shipped", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ message: "Status updated", order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= EXPORT ORDERS CSV =================

export const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: "userId", model: "user", select: "name email" })
      .populate("items.bookId", "name")
      .lean();

    const rows = [
      ["Order ID", "Customer Name", "Customer Email", "Items", "Total (INR)", "Status", "Payment Method", "Date", "Address"].join(",")
    ];

    for (const o of orders) {
      const items = o.items.map(i => `${i.bookId?.name || "Unknown"} x${i.quantity}`).join("; ");
      const address = o.address
        ? `${o.address.street}, ${o.address.city}, ${o.address.state} ${o.address.zip}, ${o.address.country}`
        : "";
      rows.push([
        o._id,
        `"${o.userId?.name || "Unknown"}"`,
        o.userId?.email || "",
        `"${items}"`,
        o.totalPrice,
        o.status,
        o.paymentMethod,
        new Date(o.createdAt).toLocaleDateString("en-GB"),
        `"${address}"`,
      ].join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="ub_books_orders_${Date.now()}.csv"`);
    return res.status(200).send(rows.join("\n"));
  } catch (error) {
    console.error("Export CSV Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= REVIEW MODERATION =================

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email")
      .populate("bookId", "name image")
      .sort({ createdAt: -1 });
    return res.status(200).json({ reviews });
  } catch (error) {
    console.error("Get All Reviews Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndUpdate(reviewId, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json({ message: "Review approved", review });
  } catch (error) {
    console.error("Approve Review Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
