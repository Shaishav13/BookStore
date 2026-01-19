import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useCartContext } from "../context/CartProvider";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [authUser, setAuthUser] = useAuth();
  const { orders } = useCartContext(); // assuming orders contain purchased books
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
  });

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("Users");
    setAuthUser(null);
    navigate("/");
  };

  // Save updated profile
  const handleSave = () => {
    const updatedUser = { ...authUser, ...userData };
    setAuthUser(updatedUser);
    localStorage.setItem("Users", JSON.stringify(updatedUser));
    setEditMode(false);
  };

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen bg-gray-100 dark:bg-slate-900 dark:text-white transition-all duration-300">

      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 space-y-8">

        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-pink-500">
          User Profile
        </h2>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 dark:text-gray-300 font-semibold">
              Name:
            </label>

            {editMode ? (
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 dark:text-white outline-none"
              />
            ) : (
              <p className="text-lg">{authUser?.name}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600 dark:text-gray-300 font-semibold">
              Email:
            </label>

            {editMode ? (
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 dark:text-white outline-none"
              />
            ) : (
              <p className="text-lg">{authUser?.email}</p>
            )}
          </div>
        </div>

        {/* Edit / Save Buttons */}
        <div className="flex justify-between">
          {editMode ? (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-md"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white shadow-md"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white shadow-md"
          >
            Logout
          </button>
        </div>

        {/* Purchased Books */}
        <div className="pt-4">
          <h3 className="text-2xl font-semibold mb-4">Purchased Books</h3>

          {orders && orders.length > 0 ? (
            <ul className="space-y-3">
              {orders.map((book) => (
                <li
                  key={book._id}
                  className="p-3 border rounded-lg bg-gray-50 dark:bg-slate-700 shadow-sm"
                >
                  <p className="font-semibold">{book.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{book.category}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No purchases yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
