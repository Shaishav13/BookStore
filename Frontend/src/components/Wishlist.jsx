import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function Wishlist() {
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem('Users'));
  const userId = user?._id;
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    axios.get(`http://localhost:4001/user/wishlist/${userId}`)
      .then(res => setWishlist(res.data.wishlist || []))
      .catch(() => setWishlist([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const removeFromWishlist = async (bookId) => {
    try {
      await axios.delete(`http://localhost:4001/user/wishlist/${userId}/${bookId}`);
      setWishlist(prev => prev.filter(b => b._id !== bookId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-white pt-28 pb-12 px-4 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-pink-500 flex items-center justify-center gap-2">
              <FaHeart /> My Wishlist
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {wishlist.length} saved {wishlist.length === 1 ? 'book' : 'books'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-pink-500"></span>
            </div>
          ) : !authUser ? (
            <div className="text-center py-20">
              <FaRegHeart className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">Please login to view your wishlist</p>
              <button
                onClick={() => document.getElementById('my_modal_3').showModal()}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all"
              >
                Login
              </button>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-20">
              <FaRegHeart className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
              <p className="text-sm text-gray-400 mb-6">Start saving books you love!</p>
              <button
                onClick={() => navigate('/course')}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all"
              >
                Browse Books
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map(book => (
                <div
                  key={book._id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div
                    className="h-52 overflow-hidden bg-gray-50 dark:bg-slate-700 cursor-pointer relative"
                    onClick={() => navigate(`/book/${book._id}`)}
                  >
                    <img
                      src={book.image}
                      alt={book.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-all duration-300"
                    />
                    {book.inStock === false && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                      </div>
                    )}
                    {book.featured && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-800 dark:text-white line-clamp-1 cursor-pointer hover:text-pink-500 transition-colors"
                      onClick={() => navigate(`/book/${book._id}`)}
                    >
                      {book.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{book.title}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200">
                      {book.category}
                    </span>
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-bold text-pink-500">₹{book.price}</p>
                      <button
                        onClick={() => removeFromWishlist(book._id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remove from wishlist"
                      >
                        <FaHeart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Wishlist;
