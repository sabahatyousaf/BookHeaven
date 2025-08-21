const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const cartController = require("../controllers/cart.controller");

// Route to add a items to the user's cart (requires authentication)
router.post("/add-to-cart", protect, cartController.addToCart);

// Route to remove a items from the user's cart (requires authentication)
router.post("/remove-from-cart", protect, cartController.removeFromCart);

// Route to remove all items from the user's cart (requires authentication)
router.delete("/remove-all-cart-items", protect, cartController.removeAllFromCart);

// Route to get items from the user's cart (requires authentication)
router.get("/get-all-cart-items", protect, cartController.getAllCartItems);

// Export the router for use in the main application
module.exports = router;
