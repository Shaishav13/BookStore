import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// ================= SIGNUP ======================

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= LOGIN =======================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET PROFILE =================

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= UPDATE PROFILE ==============

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email is taken by another user
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ message: "Email already in use by another account" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= CHANGE PASSWORD =============

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= GET ADDRESSES ===============

export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= ADD ADDRESS =================

export const addAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { label, street, city, state, zip, country, isDefault } = req.body;

    if (!street || !city || !state || !zip || !country) {
      return res.status(400).json({ message: "All address fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If new address is default, unset others
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    // First address is always default
    const makeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({ label: label || "Home", street, city, state, zip, country, isDefault: makeDefault });
    await user.save();

    return res.status(201).json({ message: "Address added", addresses: user.addresses });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= UPDATE ADDRESS ==============

export const updateAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const { label, street, city, state, zip, country, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    addr.label    = label    ?? addr.label;
    addr.street   = street   ?? addr.street;
    addr.city     = city     ?? addr.city;
    addr.state    = state    ?? addr.state;
    addr.zip      = zip      ?? addr.zip;
    addr.country  = country  ?? addr.country;
    addr.isDefault = isDefault ?? addr.isDefault;

    await user.save();
    return res.status(200).json({ message: "Address updated", addresses: user.addresses });
  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= DELETE ADDRESS ==============

export const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);

    // If deleted was default, make first remaining one default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.status(200).json({ message: "Address deleted", addresses: user.addresses });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= SET DEFAULT ADDRESS =========

export const setDefaultAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.forEach(a => { a.isDefault = a._id.toString() === addressId; });
    await user.save();
    return res.status(200).json({ message: "Default address updated", addresses: user.addresses });
  } catch (error) {
    console.error("Set Default Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ================= WISHLIST =================

export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ message: "bookId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wishlist.map(id => id.toString()).includes(bookId)) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(bookId);
    await user.save();
    return res.status(200).json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Add Wishlist Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    await user.save();
    return res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Remove Wishlist Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

