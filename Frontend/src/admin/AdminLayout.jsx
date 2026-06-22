import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdMenuBook,
  MdImportContacts,
  MdShoppingBag,
  MdMenu,
  MdClose,
  MdLogout,
  MdStore,
  MdStar,
} from "react-icons/md";
import { useAuth } from "../context/AuthProvider";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <MdDashboard size={20} /> },
  { to: "/admin/users",     label: "Users",     icon: <MdPeople size={20} /> },
  { to: "/admin/orders",    label: "Orders",    icon: <MdShoppingBag size={20} /> },
  { to: "/admin/books",     label: "Books",     icon: <MdMenuBook size={20} /> },
  { to: "/admin/ebooks",    label: "EBooks",    icon: <MdImportContacts size={20} /> },
  { to: "/admin/reviews",   label: "Reviews",   icon: <MdStar size={20} /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("Users");
    setAuthUser(undefined);
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-slate-800 dark:bg-slate-950 text-white flex flex-col shadow-xl`}
      >
        {/* Logo / Toggle */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <MdStore size={24} className="text-pink-400" />
              <span className="font-bold text-lg tracking-wide">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-slate-700 transition"
          >
            {sidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? "bg-pink-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 text-sm font-medium"
          >
            <MdLogout size={20} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-700 dark:text-white">
            UB-Books — Admin
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span>Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
