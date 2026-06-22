import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  bookId:   { type: mongoose.Schema.Types.ObjectId, ref: 'books', required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, required: true, trim: true },
  approved: { type: Boolean, default: false },
  createdAt:{ type: Date, default: Date.now },
});

// One review per user per book
reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const Review = mongoose.model('review', reviewSchema);
export default Review;
