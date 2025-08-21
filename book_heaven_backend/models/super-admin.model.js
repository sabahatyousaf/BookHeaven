const mongoose = require("mongoose");

// Define the schema for the SuperAdmin model
const superAdminSchema = new mongoose.Schema({
  // URL of the superadmin's profile picture (optional)
  profilePicture: {
    type: String,
  },

  // Username of the superadmin (required)
  userName: {
    type: String,
    required: true,
  },

  // Email of the superadmin (required, unique)
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // Password of the superadmin (required)
  password: {
    type: String,
    required: true,
  },

  // Flag to indicate if the user is a superadmin (default: true)
  isSuperAdmin: {
    type: Boolean,
    default: true,
  },
});

// Create and export the SuperAdmin model
module.exports = mongoose.model("SuperAdmin", superAdminSchema);