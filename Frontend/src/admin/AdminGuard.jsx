import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function AdminGuard({ children }) {
  const [authUser] = useAuth();

  // Check localStorage directly as a fallback — handles the case where
  // React state hasn't synced yet right after login redirect
  const storedUser = authUser || (() => {
    try {
      const raw = localStorage.getItem("Users");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  if (!storedUser) return <Navigate to="/signup" replace />;
  if (storedUser.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
