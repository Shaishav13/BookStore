import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { FaHeart } from "react-icons/fa";

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
      <li><Link to="/course">Store</Link></li>
      <li><Link to="/myorders">MyOrders</Link></li>
      {authUser && <li><Link to="/wishlist" className="flex items-center gap-1"><FaHeart className="text-pink-500" size={12} /> Wishlist</Link></li>}
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

              {/* -------- Left: Logo + Title -------- */}
              <div className="flex items-center gap-2">
                <img
                  src="/book.png"
                  alt="UB-Books Logo"
                  className="h-8 w-8 flex-shrink-0"
                />
                <h2 className="hidden sm:block text-lg md:text-2xl font-bold whitespace-nowrap">
                  UB-Books
                </h2>
              </div>

          {/* -------- Center Menu (Desktop) -------- */}
          <div className="hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {navItems}
            </ul>
          </div>

          {/* -------- Right Section -------- */}
          <div className="flex items-center gap-1 sm:gap-3">

           {/* Search — hidden on xs, visible from sm */}
<div className="hidden sm:block w-40 md:w-52">
  <div className="relative">
    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className="w-4 h-4 text-gray-400 dark:text-gray-300"
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
      className="w-full pl-9 pr-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-slate-800
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


            {/* Profile Dropdown / Login */}
            {authUser ? (
              <div className="relative group">
                {/* Avatar trigger */}
                <button className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400">
                  {(authUser.name || authUser.email || "U")
                    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  translate-y-1 group-hover:translate-y-0 transition-all duration-200
                  max-w-[calc(100vw-1rem)]">

                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{authUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{authUser.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    {authUser.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>

                    <Link
                      to="/profile?tab=password"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Change Password
                    </Link>

                    <Link
                      to="/myorders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FaHeart className="w-4 h-4 text-pink-500" />
                      My Wishlist
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 dark:border-slate-700 py-1">
                    <button
                      onClick={() => {
                        localStorage.removeItem("Users");
                        setAuthUser(undefined);
                        navigate("/");
                        window.location.reload();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
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
                <img src="/book.png" alt="UB-Books Logo" className="h-8 w-8" />
                <h2 className="text-2xl font-bold">UB-Books</h2>
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
                Store
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
                <>
                  {authUser.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-2 text-lg font-semibold text-pink-500 mb-2"
                    >
                      🛠 Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                    localStorage.removeItem("Users");
                    setAuthUser(undefined);
                    setSidebarOpen(false);
                    navigate("/");
                    window.location.reload();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 duration-300 w-full text-left"
                >
                  Logout
                </button>
                </>
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
