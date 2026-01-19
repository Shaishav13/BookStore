import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "../context/AuthProvider";
import Logout from "./Logout";
import { useCartContext } from "../context/CartProvider";

function Navbar() {
  const [authUser, setAuthUser] = useAuth();
  const [sticky, setSticky] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCartContext();

  const [theme, setTheme] = useState(
    localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "light"
  );

  const element = document.documentElement;

  // Theme handling
  useEffect(() => {
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.body.classList.add("dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.body.classList.remove("dark");
    }
  }, [theme]);

  // Sticky navbar logic
  useEffect(() => {
    const handleScroll = () => {
      // Trigger transition after scrolling 50px for smoother effect
      setSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = (
    <>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/course">Course</Link></li>
      <li><Link to="/myorders">MyOrders</Link></li>
      <li><Link to="/contact">Contact</Link></li>
      <li><Link to="/about">About</Link></li>
    </>
  );

  return (
    <>
      <div
        className={`max-w-screen-2xl dark:bg-slate-900 dark:text-white container mx-auto md:px-20 px-4 z-50 fixed top-0 right-0 left-0 transition-all duration-500 ease-in-out
        ${
          sticky
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/20 dark:border-gray-700/20 py-2"
            : "bg-transparent py-3"
        }`}
      >
        <div className={`navbar flex justify-between items-center transition-all duration-500 ease-in-out ${sticky ? 'py-2' : 'py-3'}`}>

          {/* -------- Mobile Menu Button -------- */}
          <div className="flex-none lg:hidden">
            <button 
              className="btn btn-square btn-ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>

              {/* -------- Left: Text + Logo -------- */}
              <div className="flex items-center gap-2 transition-all duration-500 ease-in-out">

            {/* LOGO */}
            <img
              src="/book.png"
              alt="UB Books Logo"
              className={`
                h-8 w-8 transition-all duration-500 ease-in-out
                ${
                  sticky
                    ? "scale-110"
                    : "scale-100"
                }
              `}
            />

            {/* TEXT - Full title when not sticky, abbreviated when sticky */}
            <div className="relative h-8 flex items-center overflow-hidden">
              {/* Full title "UB Books" */}
              <h2
                className={`
                  text-2xl font-bold transition-all duration-500 ease-in-out absolute whitespace-nowrap
                  ${
                    sticky
                      ? "opacity-0 translate-x-8 scale-90"
                      : "opacity-100 translate-x-0 scale-100"
                  }
                `}
              >
                UB Books
              </h2>
              
              {/* Abbreviated title "UB" */}
              <h2
                className={`
                  text-2xl font-bold transition-all duration-500 ease-in-out whitespace-nowrap
                  ${
                    sticky
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 -translate-x-8 scale-90"
                  }
                `}
              >
                UB
              </h2>
            </div>
          </div>

          {/* -------- Center Menu (Desktop) -------- */}
          <div className="hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {navItems}
            </ul>
          </div>

          {/* -------- Right Section -------- */}
          <div className="flex items-center gap-3">

           {/* Search */}
<div className="hidden sm:block w-52">
  <div className="relative">
    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className="w-5 h-5 text-gray-400 dark:text-gray-300"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
        />
      </svg>
    </span>

    <input
      type="text"
      placeholder="Search..."
      className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-slate-800
                 border border-gray-300 dark:border-slate-700
                 text-gray-700 dark:text-gray-200
                 placeholder-gray-400 dark:placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-blue-600
                 transition-all duration-300"
    />
  </div>
</div>


           {/* Theme Toggle */}
<button
  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
  className="p-2 rounded-full border dark:border-gray-700 border-gray-300 
             dark:hover:bg-gray-700 hover:bg-gray-200 transition-all duration-300"
>

  {/* Sun (visible in light mode) */}
  {theme === "light" && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-yellow-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314l1.414 1.414M16.95 16.95l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
      />
    </svg>
  )}

  {/* Moon (visible in dark mode) */}
  {theme === "dark" && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6 text-gray-200"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 019.003 2.248 7.502 7.502 0 0012 21.75c3.449 0 6.42-2.236 7.507-5.273a.75.75 0 00-1.403-.475 6.006 6.006 0 01-11.1-4.403A7.502 7.502 0 0012 19.5a7.502 7.502 0 009.752-4.498z"
      />
    </svg>
  )}
</button>


            {/* Cart if logged in */}
           {authUser && (
  <button
    onClick={() => navigate("/cart")}
    className="relative"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-7 h-7 cursor-pointer dark:stroke-white stroke-black"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835L7.5 14.25h11.25l2.25-6.75H6.75"
      />
      <circle cx="9" cy="19.5" r="1" />
      <circle cx="17" cy="19.5" r="1" />
    </svg>

    {/* Cart Count Badge */}
    {cartCount > 0 && (
      <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
        {cartCount}
      </span>
    )}
  </button>
)}


            {/* Login / Logout */}
            {authUser ? (
              <Logout />
            ) : (
              <div>
                <Link
                  className="bg-black text-white px-3 py-2 rounded-md hover:bg-slate-800 duration-300 cursor-pointer"
                  onClick={() =>
                    document.getElementById("my_modal_3").showModal()
                  }
                >
                  Login
                </Link>
                <Login />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* -------- Mobile Sidebar Overlay -------- */}
      {sidebarOpen && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[55] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className={`fixed top-0 left-0 h-full w-80 bg-base-200 dark:bg-slate-900 text-base-content dark:text-white z-[60] transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <ul className="menu p-4 w-full min-h-full">
            {/* Sidebar header */}
            <li className="mb-4">
              <div className="flex items-center gap-2">
                <img src="/book.png" alt="UB Books Logo" className="h-8 w-8" />
                <h2 className="text-2xl font-bold">UB Books</h2>
              </div>
            </li>
            
            {/* Navigation items */}
            <li className="mb-2">
              <Link to="/" onClick={() => setSidebarOpen(false)} className="text-lg">
                Home
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/course" onClick={() => setSidebarOpen(false)} className="text-lg">
                Course
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/myorders" onClick={() => setSidebarOpen(false)} className="text-lg">
                MyOrders
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/contact" onClick={() => setSidebarOpen(false)} className="text-lg">
                Contact
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/about" onClick={() => setSidebarOpen(false)} className="text-lg">
                About
              </Link>
            </li>
            
            {/* Divider */}
            <div className="divider"></div>
            
            {/* User section in sidebar */}
            {authUser && (
              <li className="mb-2">
                <button
                  onClick={() => {
                    navigate("/cart");
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-2 text-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835L7.5 14.25h11.25l2.25-6.75H6.75"
                    />
                    <circle cx="9" cy="19.5" r="1" />
                    <circle cx="17" cy="19.5" r="1" />
                  </svg>
                  Cart
                  {cartCount > 0 && (
                    <span className="badge badge-error">{cartCount}</span>
                  )}
                </button>
              </li>
            )}
            
            {/* Login/Logout in sidebar */}
            <li>
              {authUser ? (
                <div onClick={() => setSidebarOpen(false)}>
                  <Logout />
                </div>
              ) : (
                <button
                  onClick={() => {
                    document.getElementById("my_modal_3").showModal();
                    setSidebarOpen(false);
                  }}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-slate-800 duration-300"
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </div>
        </>
      )}
    </>
  );
}

export default Navbar;
