import React from "react";
import { Link } from "react-router-dom";

function BuyModal({ bookId, bookName, price, onConfirm }) {
  return (
    <dialog id="my_modal_buy" className="modal">
      <div className="modal-box p-0 overflow-hidden dark:bg-slate-900 dark:text-white rounded-xl shadow-xl transition-all duration-300">

        {/* Header Close Button */}
        <button
          onClick={() => document.getElementById("my_modal_buy").close()}
          className="absolute right-3 top-3 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl font-bold"
        >
          ✕
        </button>

        {/* Icon and Message */}
        <div className="p-8 text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-pink-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Add to Cart?
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
            Are you sure you want to add{" "}
            <span className="font-medium text-pink-500">{bookName || "this item"}</span>{" "}
            to your cart?
          </p>

          {/* Book Price */}
          {price && (
            <p className="text-lg font-semibold text-pink-500">
              ₹{price}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3 border-t border-gray-200 dark:border-slate-700 py-4 px-6">

          <button
            onClick={() => document.getElementById("my_modal_buy").close()}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm && onConfirm(bookId);
              document.getElementById("my_modal_buy").close();
            }}
            className="px-6 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default BuyModal;
