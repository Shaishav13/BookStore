import React, { useEffect, useState } from "react";
import Card from "./Card";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthProvider";

function Course() {
  const [book, setBook] = useState([]);
  const [authUser] = useAuth();
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("Users") || "null")
      : null;

  const displayName =
    authUser && storedUser
      ? storedUser.name ||
        storedUser.username ||
        storedUser.email ||
        "User"
      : "Guest";

  // Filter state
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getBooks = async () => {
      try {
        const res = await axios.get("http://localhost:4001/book");
        setBook(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getBooks();
  }, []);

  // Derived filtered books
  const filteredBooks = book.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <section className="pt-28 pb-10 bg-gray-50 dark:bg-slate-900 dark:text-white transition-all duration-300 px-4">

        {/* Header */}
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-pink-500 animate__animated animate__zoomInDown">
            Explore Courses & Books
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            Welcome, <span className="font-semibold">{displayName}</span>
          </p>

          <p className="text-base md:text-lg max-w-3xl mx-auto text-gray-500 dark:text-gray-300 leading-relaxed">
            Discover a wide range of curated books to fuel your reading journey.
            Whether you're into academic subjects, skill development, or fiction,
            we&apos;ve got you covered.
          </p>

          <Link to="/">
            <button className="mt-6 px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 active:scale-95">
              Back to Home
            </button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 px-5 rounded-full text-sm bg-white dark:bg-slate-800 
                         border border-gray-300 dark:border-slate-700
                         placeholder-gray-400 dark:placeholder-gray-500
                         text-gray-700 dark:text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-pink-500
                         transition-all duration-300"
            />
            <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              🔍
            </span>
          </div>
        </div>

      </section>

      {/* Course Grid */}
      <div className="mt-10 pb-20 max-w-6xl mx-auto px-4">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map((data) => (
              <div
                key={data._id}
                className="transform transition-all hover:-translate-y-2 hover:shadow-xl duration-300"
              >
                <Card item={data} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center pt-10 text-gray-500 dark:text-gray-400">
            <p>No books match your search.</p>
          </div>
        )}
      </div>

     
    </>
  );
}

export default Course;
