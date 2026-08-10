import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";
import toast from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { FiShoppingCart, FiCreditCard, FiArrowLeft, FiStar } from "react-icons/fi";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";

// Static reviews per book — keyed by book name keyword
const REVIEW_MAP = {
  "Ikigai": [
    { name: "Priya S.", rating: 5, text: "Life-changing read. Helped me find purpose in everyday routines." },
    { name: "Arjun M.", rating: 5, text: "Simple, profound, and beautifully written. Highly recommend." },
    { name: "Sneha R.", rating: 4, text: "Great philosophy. Some parts felt repetitive but overall excellent." },
  ],
  "Alchemist": [
    { name: "Rahul K.", rating: 5, text: "A timeless masterpiece. Read it twice and loved it both times." },
    { name: "Meera T.", rating: 5, text: "Paulo Coelho at his best. Every page has a lesson." },
    { name: "Dev P.", rating: 4, text: "Beautifully written. The journey of Santiago is truly inspiring." },
  ],
  "Sapiens": [
    { name: "Ankit V.", rating: 5, text: "Mind-blowing perspective on human history. A must-read." },
    { name: "Riya B.", rating: 4, text: "Dense but rewarding. Changed how I see the world." },
    { name: "Karan J.", rating: 5, text: "Yuval Noah Harari is a genius. Absolutely fascinating." },
  ],
  "Rich Dad": [
    { name: "Suresh N.", rating: 5, text: "Changed my mindset about money completely. Practical and eye-opening." },
    { name: "Pooja L.", rating: 4, text: "Great financial wisdom. Some examples are dated but core ideas are solid." },
    { name: "Amit C.", rating: 5, text: "Every young person should read this before starting their career." },
  ],
  "5 AM": [
    { name: "Neha G.", rating: 5, text: "Transformed my mornings. The 20/20/20 formula actually works!" },
    { name: "Vikram S.", rating: 4, text: "Motivating and practical. Robin Sharma delivers again." },
    { name: "Tanya M.", rating: 4, text: "Great habits framework. Took me a month to implement but worth it." },
  ],
  "Think": [
    { name: "Rohit D.", rating: 5, text: "Classic wealth-building principles that still hold true today." },
    { name: "Kavya P.", rating: 4, text: "Timeless wisdom. The chapter on persistence is gold." },
    { name: "Sanjay R.", rating: 5, text: "Napoleon Hill's masterwork. Read it every year." },
  ],
  "Murder": [
    { name: "Ishaan T.", rating: 4, text: "Chetan Bhagat at his thriller best. Couldn't put it down." },
    { name: "Divya K.", rating: 5, text: "Gripping plot with great twists. Finished in one sitting." },
    { name: "Arun M.", rating: 4, text: "Fun, fast-paced read. Perfect for a weekend." },
  ],
};

// Default reviews for books not in the map
const DEFAULT_REVIEWS = [
  { name: "Aisha K.", rating: 5, text: "Absolutely loved this book. Highly recommend to everyone!" },
  { name: "Rohan S.", rating: 4, text: "Great read. Insightful and well-written throughout." },
  { name: "Priya M.", rating: 5, text: "One of the best books I've read this year. Couldn't put it down." },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          size={14}
          className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function StarInput({ rating, setRating }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(s)}
          className="transition-transform hover:scale-125">
          <FiStar size={24} className={s <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  );
}

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [authUser] = useAuth();
  const { setCartCount } = useCartContext();
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = authUser ? user?._id : null;
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/book/${id}`);
        setBook(res.data);
        addToRecentlyViewed(res.data);

        // Fetch related books using dedicated endpoint
        const relatedRes = await axios.get(`${API_URL}/book/${id}/related`);
        setRelatedBooks(relatedRes.data.slice(0, 4));

        // Fetch approved reviews
        const reviewRes = await axios.get(`${API_URL}/review/book/${id}`);
        setReviews(reviewRes.data.reviews || []);

        // Check if current user can review
        if (userId) {
          const canRes = await axios.get(`${API_URL}/review/can-review/${userId}/${id}`);
          setCanReview(canRes.data.canReview);
          setAlreadyReviewed(canRes.data.alreadyReviewed);
        }
      } catch (err) {
        toast.error("Failed to load book details.");
        navigate("/course");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToCart = async () => {
    if (!authUser) {
      toast.error("Please login to add to cart.");
      return;
    }
    setAddingToCart(true);
    try {
      await axios.post(`${API_URL}/cart/create`, {
        userId,
        bookId: book._id,
        quantity: 1,
      });
      toast.success("Added to cart!");
      const res = await axios.get(`${API_URL}/cart/${userId}`);
      setCartCount(res.data.items.length);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!authUser) {
      toast.error("Please login to purchase.");
      return;
    }
    // Add to cart first, then go to payment
    try {
      await axios.post(`${API_URL}/cart/create`, {
        userId,
        bookId: book._id,
        quantity: 1,
      });
      const res = await axios.get(`${API_URL}/cart/${userId}`);
      setCartCount(res.data.items.length);
      navigate("/payment");
    } catch (err) {
      // If already in cart, just go to payment
      navigate("/payment");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
    setSubmittingReview(true);
    try {
      await axios.post(`${API_URL}/review`, {
        userId, bookId: id, rating: reviewRating, comment: reviewComment,
      });
      toast.success('Review submitted! Pending admin approval.');
      setCanReview(false);
      setAlreadyReviewed(true);
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading book details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!book) return null;

  const avg = avgRating;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white pt-24 pb-16 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 mb-6 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* ── Main Book Card ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row">

              {/* Book Image */}
              <div className="md:w-72 lg:w-80 flex-shrink-0 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center p-8 min-h-[300px]">
                <img
                  src={book.image}
                  alt={book.name}
                  className="max-h-72 w-auto object-contain drop-shadow-xl rounded-lg"
                />
              </div>

              {/* Book Info */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  {/* Category badge */}
                  <span className="inline-block px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
                    {book.category}
                  </span>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {book.name}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-gray-500 dark:text-gray-400 text-base mb-4 leading-relaxed">
                    {book.title}
                  </p>

                  {/* Rating summary */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          size={18}
                          className={star <= Math.round(avg) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{avg}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({reviews.length} reviews)</span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Category</p>
                      <p className="font-semibold text-gray-800 dark:text-white">{book.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Language</p>
                      <p className="font-semibold text-gray-800 dark:text-white">English</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Format</p>
                      <p className="font-semibold text-gray-800 dark:text-white">Paperback</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Availability</p>
                      {book.inStock === false ? (
                        <p className="font-semibold text-red-500 dark:text-red-400">Out of Stock</p>
                      ) : (
                        <p className="font-semibold text-green-600 dark:text-green-400">In Stock</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price + Actions */}
                <div>
                  <div className="flex items-baseline gap-3 mb-5">
                    {book.inStock === false ? (
                      <span className="text-3xl font-bold text-gray-500 dark:text-gray-400">Out of Stock</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-pink-500">₹{book.price}</span>
                        <span className="text-sm text-gray-400 line-through">₹{Math.round(book.price * 1.2)}</span>
                        <span className="text-sm font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                          17% off
                        </span>
                      </>
                    )}
                  </div>

                  {authUser ? (
                    book.inStock === false ? (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-center">
                        <p className="text-red-600 dark:text-red-400 font-semibold text-sm">
                          This book is currently out of stock.
                        </p>
                        <p className="text-red-400 dark:text-red-500 text-xs mt-1">Check back later or browse other titles.</p>
                      </div>
                    ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60"
                      >
                        <FiShoppingCart size={18} />
                        {addingToCart ? "Adding..." : "Add to Cart"}
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                      >
                        <FiCreditCard size={18} />
                        Buy Now
                      </button>
                    </div>
                    )
                  ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center">
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                        Please <button onClick={() => document.getElementById("my_modal_3").showModal()} className="underline font-bold">login</button> to purchase or add to cart.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── About This Book ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About This Book</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold text-gray-800 dark:text-white">{book.name}</span> — {book.title}.
              This book belongs to the <span className="text-pink-500 font-medium">{book.category}</span> category
              and is one of the most sought-after titles in our collection. Whether you're a seasoned reader
              or just starting your reading journey, this book offers valuable insights and an engaging narrative
              that will keep you turning pages. Available in paperback format, it makes for a perfect addition
              to your personal library or as a thoughtful gift.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Bestseller", book.category, "Recommended", "Top Rated"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  #{tag.replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          </div>

          {/* ── Customer Reviews ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
              {avg && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{avg}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar key={star} size={14} className={star <= Math.round(avg) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{reviews.length} reviews</p>
                  </div>
                </div>
              )}
            </div>

            {/* Write a Review Form */}
            {authUser && canReview && (
              <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800/30 rounded-xl">
                <p className="font-semibold text-gray-800 dark:text-white text-sm mb-3">✍️ Write a Review</p>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Your Rating</p>
                  <StarInput rating={reviewRating} setRating={setReviewRating} />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  rows={3}
                  className="w-full p-3 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none mb-3"
                />
                <button type="submit" disabled={submittingReview}
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
            {authUser && alreadyReviewed && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
                <p className="text-emerald-700 dark:text-emerald-400 text-sm">✅ You've already reviewed this book. Thank you!</p>
              </div>
            )}
            {authUser && !canReview && !alreadyReviewed && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl">
                <p className="text-blue-700 dark:text-blue-400 text-sm">💡 Purchase this book to leave a review.</p>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No approved reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(review.userId?.name || review.name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white text-sm">{review.userId?.name || review.name}</p>
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Verified Purchase</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-2">
                      "{review.comment || review.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Related Books ── */}
          {relatedBooks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                More in <span className="text-pink-500">{book.category}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {relatedBooks.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => navigate(`/book/${b._id}`)}
                    className="cursor-pointer group bg-gray-50 dark:bg-slate-700 rounded-xl p-3 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="h-32 flex items-center justify-center mb-3 overflow-hidden rounded-lg bg-white dark:bg-slate-600">
                      <img src={b.image} alt={b.name} className="max-h-full object-contain group-hover:scale-105 transition-all duration-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 leading-tight">{b.name}</p>
                    {b.inStock === false ? (
                      <p className="text-gray-500 font-bold text-sm mt-1">Out of Stock</p>
                    ) : (
                      <p className="text-pink-500 font-bold text-sm mt-1">₹{b.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default BookDetail;
