import express from 'express'
import {
  login, signup,
  getProfile, updateProfile, changePassword,
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
  getWishlist, addToWishlist, removeFromWishlist,
} from '../controller/user.controller.js';

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.get("/profile/:userId", getProfile)
router.put("/profile/:userId", updateProfile)
router.put("/change-password/:userId", changePassword)

// Address routes
router.get("/addresses/:userId", getAddresses)
router.post("/addresses/:userId", addAddress)
router.put("/addresses/:userId/:addressId", updateAddress)
router.delete("/addresses/:userId/:addressId", deleteAddress)
router.put("/addresses/:userId/:addressId/default", setDefaultAddress)

// Wishlist routes
router.get("/wishlist/:userId", getWishlist)
router.post("/wishlist/:userId", addToWishlist)
router.delete("/wishlist/:userId/:bookId", removeFromWishlist)

export default router
