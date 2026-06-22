import { useEffect, useState } from "react";
import Card from "./Card";
import EBookCard from "./EBookCard";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthProvider";
import { FiBook, FiTablet, FiSliders } from "react-icons/fi";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";

function Course() {
  const [books, setBooks] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [activeTab, setActiveTab] = useState("books");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [authUser] = useAuth();
  const navigate = useNavigate();
  const { items: recentlyViewed } = useRecentlyViewed();

  const storedUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("Users") || "null") : null;

  const displayName = authUser && storedUser
    ? storedUser.name || storedUser.email || "User" : "Guest";

  // Fetch books with filters
  const fetchBooks = (cat = selectedCategory, min = minPrice, max = maxPrice, q = search) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (min) params.set("minPrice", min);
    if (max) params.set("maxPrice", max);
    if (q) params.set("search", q);
    axios.get(`http://localhost:4001/book?${params.toString()}`)
      .then(r => setBooks(r.data))
      .catch(console.error);
  };

  // Fetch categories
  useEffect(() => {
    axios.get("http://localhost:4001/book/categories")
      .then(r => setCategories(r.data))
      .catch(console.error);
  }, []);

  // Fetch books on filter change
  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, minPrice, maxPrice]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchBooks(selectedCategory, minPrice, maxPrice, search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch ebooks + auto-seed if empty
  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        const res = await axios.get("http://localhost:4001/ebook");
        if (res.data.length === 0) {
          await axios.get("http://localhost:4001/ebook/seed");
          const seeded = await axios.get("http://localhost:4001/ebook");
          setEbooks(seeded.data);
        } else {
          setEbooks(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEbooks();
  }, []);

  const filteredEbooks = ebooks.filter(b =>
    b.inStock !== false &&
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasFilters = selectedCategory || minPrice || maxPrice;

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  };

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-6 bg-gray-50 dark:bg-slate-900 dark:text-white transition-all duration-300 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-bold text-pink-500 animate__animated animate__zoomInDown">
            {activeTab === "books" ? "Book Store" : "eBook Store"}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Welcome, <span className="font-semibold">{displayName}</span>
          </p>
          <Link to="/">
            <button className="mt-2 px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md transition-all duration-300 active:scale-95 text-sm">
              ← Back to Home
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="max-w-xs mx-auto mt-8 bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm flex gap-2">
          <button
            onClick={() => { setActiveTab("books"); setSearch(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${activeTab === "books" ? "bg-pink-500 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"}`}
          >
            <FiBook size={15} /> Books
          </button>
          <button
            onClick={() => { setActiveTab("ebooks"); setSearch(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${activeTab === "ebooks" ? "bg-pink-500 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"}`}
          >
            <FiTablet size={15} /> eBooks
          </button>
        </div>

        {/* Search + Filter Bar */}
        <div className="max-w-4xl mx-auto mt-6 flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Search ${activeTab === "books" ? "books" : "ebooks"}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-3 px-5 rounded-full text-sm bg-white dark:bg-slate-800
                         border border-gray-300 dark:border-slate-700
                         placeholder-gray-400 dark:placeholder-gray-500
                         text-gray-700 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
            />
            <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">🔍</span>
          </div>
          {activeTab === "books" && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                hasFilters
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-pink-400'
              }`}
            >
              <FiSliders size={15} /> Filters {hasFilters && '•'}
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && activeTab === "books" && (
          <div className="max-w-4xl mx-auto mt-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md p-5 border border-gray-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Category */}
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              {/* Min Price */}
              <div className="min-w-[100px]">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Min ₹</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              {/* Max Price */}
              <div className="min-w-[100px]">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Max ₹</label>
                <input type="number" placeholder="9999" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
              {/* Clear */}
              <button onClick={clearFilters}
                className="px-4 py-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
                Clear All
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && authUser && (
        <div className="bg-gray-50 dark:bg-slate-900 px-4 pb-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              👁️ Recently Viewed
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.slice(0, 6).map(book => (
                <div
                  key={book._id}
                  onClick={() => navigate(`/book/${book._id}`)}
                  className="flex-shrink-0 w-28 cursor-pointer group"
                >
                  <div className="h-36 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow border border-gray-200 dark:border-slate-700 flex items-center justify-center">
                    <img src={book.image} alt={book.name} className="max-h-full object-contain group-hover:scale-105 transition-all duration-300 p-2" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 text-center">{book.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="pb-20 bg-gray-50 dark:bg-slate-900 dark:text-white transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 pt-8">

          {activeTab === "books" && (
            books.length > 0 ? (
              <>
                {hasFilters && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Showing {books.length} result{books.length !== 1 ? 's' : ''}
                    {selectedCategory && ` in "${selectedCategory}"`}
                    {minPrice && ` from ₹${minPrice}`}
                    {maxPrice && ` to ₹${maxPrice}`}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map(data => (
                    <div key={data._id} className="transform transition-all hover:-translate-y-2 hover:shadow-xl duration-300">
                      <Card item={data} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center pt-16 text-gray-500 dark:text-gray-400">
                <FiBook size={48} className="mx-auto mb-3 opacity-30" />
                <p>No books match your search or filters.</p>
                <button onClick={clearFilters} className="mt-3 text-pink-500 underline text-sm">Clear filters</button>
              </div>
            )
          )}

          {activeTab === "ebooks" && (
            filteredEbooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEbooks.map(data => (
                  <div key={data._id} className="transform transition-all hover:-translate-y-2 hover:shadow-xl duration-300">
                    <EBookCard item={data} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center pt-16 text-gray-500 dark:text-gray-400">
                <FiTablet size={48} className="mx-auto mb-3 opacity-30" />
                <p>No eBooks match your search.</p>
              </div>
            )
          )}

        </div>
      </div>
    </>
  );
}

export default Course;
