const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const superAdminController = require("../controllers/super-admin.controller");

// Route to register a new SuperAdmin (handles profile picture upload)
router.post(
  "/signup-super-admin",
  profilePictureUpload.upload, // Handle profile picture upload
  superAdminController.registerSuperAdmin // Controller to handle registration
);

// Route to log in a SuperAdmin
router.post("/signin-super-admin", superAdminController.loginSuperAdmin);

// Route to fetch a SuperAdmin by ID (requires authentication)
router.get(
  "/get-super-admin-by-id/:id",
  protect,
  superAdminController.getSuperAdminById
);

// Route to reset a SuperAdmin's password (requires authentication)
router.patch(
  "/reset-super-admin-password",
  protect,
  superAdminController.resetSuperAdminPassword
);

// Route to log out a SuperAdmin (requires authentication)
router.post(
  "/logout-super-admin",
  protect,
  superAdminController.logoutSuperAdmin
);

// Route to fetch all users (requires authentication)
router.get("/get-all-users", protect, superAdminController.getUsers);

// Export the router for use in the main application
module.exports = router;