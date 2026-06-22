import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function FeaturedEBooks() {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch featured ebooks and take the first 6
    axios.get('http://localhost:4001/ebook?featured=true')
      .then(r => setFeatured(r.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            📱 <span className="text-purple-600">Featured</span> E-Books
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Read instantly on your device</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {featured.map(ebook => (
            <div
              key={ebook._id}
              onClick={() => navigate(`/ebook/${ebook._id}`)}
              className="cursor-pointer group bg-white dark:bg-slate-800 rounded-xl shadow-md border border-purple-200 dark:border-purple-900/30 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-40 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 p-2 relative">
                <img
                  src={ebook.image}
                  alt={ebook.name}
                  className="max-h-full object-contain group-hover:scale-105 transition-all duration-300"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  eBook
                </div>
              </div>
              <div className="p-3 flex flex-col h-[88px] justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white line-clamp-2">{ebook.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">by {ebook.author}</p>
                </div>
                {ebook.inStock === false ? (
                  <p className="text-gray-500 font-bold text-sm mt-1">Out of Stock</p>
                ) : (
                  <p className="text-purple-600 font-bold text-sm mt-1">₹{ebook.price}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/ebooks')}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-all shadow-md"
          >
            Browse All E-Books →
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedEBooks;
