import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { FiTablet, FiShoppingCart } from "react-icons/fi";

function EBookCard({ item }) {
  const [authUser] = useAuth();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("Users"));
  const userId = authUser ? user?._id : null;
  const [owned, setOwned] = useState(false);

  // Check if user already owns this ebook
  useEffect(() => {
    if (!userId || !item._id) return;
    axios.get(`http://localhost:4001/ebook/owns/${userId}/${item._id}`)
      .then(r => setOwned(r.data.owned))
      .catch(() => {});
  }, [userId, item._id]);

  return (
    <div
      className="p-3 cursor-pointer"
      onClick={() => navigate(`/ebook/${item._id}`)}
    >
      <div className="group bg-white dark:bg-slate-900 dark:border dark:border-slate-700 shadow-md
        rounded-xl overflow-hidden border border-gray-200
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">

        {/* Cover image */}
        <div className="overflow-hidden h-56 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 relative">
          <img
            src={item.image}
            alt={item.name}
            className={`object-contain h-full w-full group-hover:scale-105 transition-all duration-300 ${item.inStock === false ? "opacity-50 grayscale" : ""}`}
            onError={e => { e.target.style.display = 'none'; }}
          />
          {/* eBook badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            <FiTablet size={10} /> eBook
          </div>
          {/* Out of stock overlay */}
          {item.inStock === false && !owned && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide uppercase shadow">
                Unavailable
              </span>
            </div>
          )}
          {owned && item.inStock !== false && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Owned
            </div>
          )}
          {/* Hover hint */}
          {(item.inStock !== false || owned) && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white dark:bg-slate-800 text-gray-700 dark:text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
                {owned ? "Read Now" : "View Details"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-grow">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white line-clamp-1">{item.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">by {item.author}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2 mt-1">{item.title}</p>

          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
              {item.category}
            </span>
            {item.pages > 0 && (
              <span className="text-xs text-gray-400">{item.pages} pages</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            {item.inStock === false && !owned ? (
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Out of Stock</p>
            ) : (
              <p className="text-lg font-bold text-pink-600 dark:text-pink-400">₹{item.price}</p>
            )}
            {item.inStock === false && !owned ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed">
                Unavailable
              </span>
            ) : authUser ? (
              owned ? (
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/ebook/${item._id}`); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500 text-white hover:bg-green-600 active:scale-95 transition-all"
                >
                  📖 Read
                </button>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/ebook/${item._id}`); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-pink-500 text-white hover:bg-pink-600 active:scale-95 transition-all"
                >
                  <FiShoppingCart size={12} /> Buy
                </button>
              )
            ) : (
              <p className="text-xs text-gray-400 italic">Login to buy</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EBookCard;
