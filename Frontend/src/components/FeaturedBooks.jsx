import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function FeaturedBooks() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:4001/book?featured=true')
      .then(r => setFeatured(r.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-yellow-50 to-pink-50 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            ⭐ <span className="text-pink-500">Featured</span> Books
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Handpicked by our editors</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {featured.map(book => (
            <div
              key={book._id}
              onClick={() => navigate(`/book/${book._id}`)}
              className="cursor-pointer group bg-white dark:bg-slate-800 rounded-xl shadow-md border border-yellow-200 dark:border-yellow-900/30 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-40 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 p-2">
                <img
                  src={book.image}
                  alt={book.name}
                  className="max-h-full object-contain group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2">{book.name}</p>
                {book.inStock === false ? (
                  <p className="text-gray-500 font-bold text-sm mt-1">Out of Stock</p>
                ) : (
                  <p className="text-pink-500 font-bold text-sm mt-1">₹{book.price}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/course')}
            className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-full transition-all shadow-md"
          >
            Browse All Books →
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedBooks;
