import Review from '../models/review.model.js';
import Order from '../models/order.model.js';

// ============ POST A REVIEW (only if user purchased the book) ============
export const addReview = async (req, res) => {
  try {
    const { userId, bookId, rating, comment } = req.body;
    if (!userId || !bookId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Verify user has purchased this book
    const hasPurchased = await Order.findOne({
      userId,
      'items.bookId': bookId,
      status: { $in: ['Paid', 'Shipped', 'Completed'] },
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review books you have purchased.' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ userId, bookId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this book.' });
    }

    const review = await Review.create({ userId, bookId, rating, comment });
    return res.status(201).json({ message: 'Review submitted. Pending approval.', review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already reviewed.' });
    console.error('Add Review Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ============ GET APPROVED REVIEWS FOR A BOOK ============
export const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ bookId, approved: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json({ reviews });
  } catch (err) {
    console.error('Get Reviews Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ============ CHECK IF USER CAN REVIEW A BOOK ============
export const canUserReview = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const hasPurchased = await Order.findOne({
      userId,
      'items.bookId': bookId,
      status: { $in: ['Paid', 'Shipped', 'Completed'] },
    });

    const alreadyReviewed = await Review.findOne({ userId, bookId });

    return res.status(200).json({
      canReview: !!hasPurchased && !alreadyReviewed,
      hasPurchased: !!hasPurchased,
      alreadyReviewed: !!alreadyReviewed,
    });
  } catch (err) {
    console.error('Can Review Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ============ ADMIN: GET ALL REVIEWS ============
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('bookId', 'name image')
      .sort({ createdAt: -1 });
    return res.status(200).json({ reviews });
  } catch (err) {
    console.error('Get All Reviews Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ============ ADMIN: APPROVE REVIEW ============
export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndUpdate(reviewId, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    return res.status(200).json({ message: 'Review approved', review });
  } catch (err) {
    console.error('Approve Review Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ============ ADMIN: DELETE REVIEW ============
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    return res.status(200).json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Delete Review Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
