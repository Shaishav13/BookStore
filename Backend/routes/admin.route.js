import express from "express";
import multer from "multer";
import {
  getDashboardStats, getMonthlyRevenue,
  getAllUsers, deleteUser, updateUserRole,
  getAllBooksAdmin, createBookAdmin, updateBookAdmin, deleteBookAdmin,
  toggleBookStock, toggleBookFeatured, bulkUploadBooks,
  getAllEBooksAdmin, createEBookAdmin, updateEBookAdmin, deleteEBookAdmin,
  toggleEBookStock, toggleEBookFeatured,
  getAllOrders, updateOrderStatus, exportOrdersCSV,
  getAllReviews, approveReview, deleteReview,
} from "../controller/admin.controller.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All admin routes are protected
router.use(requireAdmin);

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/revenue/monthly", getMonthlyRevenue);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUser);
router.put("/users/:userId/role", updateUserRole);

// Books
router.get("/books", getAllBooksAdmin);
router.post("/books", createBookAdmin);
router.put("/books/:bookId", updateBookAdmin);
router.delete("/books/:bookId", deleteBookAdmin);
router.patch("/books/:bookId/stock", toggleBookStock);
router.patch("/books/:bookId/featured", toggleBookFeatured);
router.post("/books/bulk-upload", upload.single("csv"), bulkUploadBooks);

// EBooks
router.get("/ebooks", getAllEBooksAdmin);
router.post("/ebooks", createEBookAdmin);
router.put("/ebooks/:ebookId", updateEBookAdmin);
router.delete("/ebooks/:ebookId", deleteEBookAdmin);
router.patch("/ebooks/:ebookId/stock", toggleEBookStock);
router.patch("/ebooks/:ebookId/featured", toggleEBookFeatured);

// Orders
router.get("/orders", getAllOrders);
router.get("/orders/export", exportOrdersCSV);
router.patch("/orders/:orderId/status", updateOrderStatus);

// Reviews
router.get("/reviews", getAllReviews);
router.patch("/reviews/:reviewId/approve", approveReview);
router.delete("/reviews/:reviewId", deleteReview);

export default router;
