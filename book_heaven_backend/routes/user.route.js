const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const userController = require("../controllers/user.controller");

// Route to register a new user (handles profile picture upload)
router.post(
  "/signup-user",
  profilePictureUpload.upload, // Handle profile picture upload
  userController.registerUser // Controller to handle registration
);

// Route to log in a user
router.post("/signin-user", userController.loginUser);

// Route to fetch a user by ID (requires authentication)
router.get("/get-user-by-id/:id", protect, userController.getUserById);

// Route to fetch all users (requires authentication)
router.get("/get-all-users", protect, userController.getAllUsers);

// Route to fetch the books in library (requires authentication)
router.get("/get-library-books", protect, userController.getLibrary);

// Route to reset a user's password (requires authentication)
router.patch("/reset-user-password", protect, userController.resetUserPassword);

// Route to update a user's profile (requires authentication)
router.patch(
  "/update-user/:id",
  profilePictureUpload.upload,
  protect,
  userController.updateUser
);

// Route to log out a user (requires authentication)
router.post("/logout-user", protect, userController.logoutUser);

// Route to delete profile
router.delete(
  "/delete-user/:id",
  protect,
  userController.deleteProfile
);

// Export the router for use in the main application
module.exports = router;
