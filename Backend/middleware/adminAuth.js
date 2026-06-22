import User from "../models/user.model.js";

// Simple admin check middleware — reads adminId from request header
export const requireAdmin = async (req, res, next) => {
  try {
    const adminId = req.headers["x-admin-id"];
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(adminId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
