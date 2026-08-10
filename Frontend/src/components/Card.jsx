import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthProvider';
import { useCartContext } from '../context/CartProvider';
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function Card({ item }) {
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem("Users"));
  const { setCartCount } = useCartContext();
  const userId = authUser && user ? user._id : null;
  const navigate = useNavigate();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check wishlist status on mount
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/user/wishlist/${userId}`)
      .then(res => {
        const ids = (res.data.wishlist || []).map(b => b._id || b);
        setInWishlist(ids.includes(item._id));
      })
      .catch(() => {});
  }, [userId, item._id]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const quantity = 1;
    try {
      await axios.post(`${API_URL}/cart/create`, { userId, bookId: item._id, quantity });
      toast.success("Book added to cart!");
      const res = await axios.get(`${API_URL}/cart/${user._id}`);
      setCartCount(res.data.items.length);
    } catch (err) {
      toast.error("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!authUser) { toast.error("Login to use wishlist"); return; }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await axios.delete(`${API_URL}/user/wishlist/${userId}/${item._id}`);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`${API_URL}/user/wishlist/${userId}`, { bookId: item._id });
        setInWishlist(true);
        toast.success("Added to wishlist ❤️");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="p-3 cursor-pointer" onClick={() => navigate(`/book/${item._id}`)}>
      <div className="
        group bg-white dark:bg-slate-900 dark:border dark:border-slate-700 shadow-md
        rounded-xl overflow-hidden border border-gray-200
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        flex flex-col
      ">

        {/* Image */}
        <div className="overflow-hidden h-56 flex items-center justify-center bg-gray-50 dark:bg-slate-800 relative">
          <img
            src={item.image}
            alt={item.name}
            className={`object-contain h-full w-full group-hover:scale-105 transition-all duration-300 ${item.inStock === false ? "opacity-50 grayscale" : ""}`}
          />
          {/* Featured badge */}
          {item.featured && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">⭐ Featured</span>
          )}
          {/* Out of stock overlay */}
          {item.inStock === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase shadow">
                Out of Stock
              </span>
            </div>
          )}
          {item.inStock !== false && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white dark:bg-slate-800 text-gray-700 dark:text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                View Details
              </span>
            </div>
          )}
          {/* Wishlist heart — rendered last so it's above overlays */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow-md transition-all duration-200 ${
              inWishlist
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
            } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {inWishlist ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-grow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">{item.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2 mt-1">{item.title}</p>
          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200">
            {item.category}
          </span>

          <div className="flex items-center justify-between mt-4">
            {item.inStock === false ? (
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Out of Stock</p>
            ) : (
              <p className="text-lg font-bold text-pink-600 dark:text-pink-400">₹{item.price}</p>
            )}

            {item.inStock === false ? (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed">
                Unavailable
              </span>
            ) : authUser ? (
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 rounded-full text-sm font-medium bg-pink-500 text-white hover:bg-pink-600 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Add to Cart
              </button>
            ) : (
              <p className="text-xs text-gray-400 italic">Login to purchase</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
