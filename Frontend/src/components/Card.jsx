import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthProvider';
import { useCartContext } from '../context/CartProvider';

function Card({ item }) {
  const [authUser] = useAuth();
  const user = JSON.parse(localStorage.getItem("Users"));
  const { setCartCount } = useCartContext();
  const userId = authUser ? user._id : "null";

  const handleAddToCart = async () => {
    const quantity = 1;

    try {
      await axios.post("http://localhost:4001/cart/create", {
        userId,
        bookId: item._id,
        quantity,
      });

      toast.success("Book added to cart successfully!");

      const res = await axios.get(`http://localhost:4001/cart/${user._id}`);
      setCartCount(res.data.items.length);
      
    } catch (err) {
      toast.error("Error: " + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-3">
      <div className="
        group bg-white dark:bg-slate-900 dark:border dark:border-slate-700 shadow-md
        rounded-xl overflow-hidden border border-gray-200
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        flex flex-col
      ">

        {/* Image */}
        <div className="overflow-hidden h-56 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
          <img
            src={item.image}
            alt={item.name}
            className="object-contain h-full w-full group-hover:scale-105 transition-all duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-grow">

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-1">
            {item.name}
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2 mt-1">
            {item.title}
          </p>

          {/* Category Pill */}
          <span className="
            inline-block mt-2 px-3 py-1 text-xs rounded-full
            bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-200
          ">
            {item.category}
          </span>

          {/* Price + Action */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
              ₹{item.price}
            </p>

            {authUser ? (
              <button
                onClick={handleAddToCart}
                className="
                  px-4 py-2 rounded-full text-sm font-medium 
                  bg-pink-500 text-white hover:bg-pink-600
                  active:scale-95 transition-all duration-200
                  shadow-sm hover:shadow-md
                "
              >
                Add to Cart
              </button>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Login to purchase
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Card;
