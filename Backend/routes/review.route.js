import express from 'express';
import {
  addReview,
  getBookReviews,
  canUserReview,
  getAllReviewsAdmin,
  approveReview,
  deleteReview,
} from '../controller/review.controller.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public / user routes
router.post('/', addReview);
router.get('/book/:bookId', getBookReviews);
router.get('/can-review/:userId/:bookId', canUserReview);

// Admin routes
router.get('/admin/all', requireAdmin, getAllReviewsAdmin);
router.patch('/admin/:reviewId/approve', requireAdmin, approveReview);
router.delete('/admin/:reviewId', requireAdmin, deleteReview);

export default router;
