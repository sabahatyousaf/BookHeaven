const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const jwt = require("jsonwebtoken");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const {
  uploadToCloudinary,
} = require("../utilities/cloudinary/cloudinary.utility");
const { v2: cloudinary } = require("cloudinary");

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      phone,
      address,
      cart,
      favorites,
      orders,
    } = req.body;

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({
      email,
      role: "USER",
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Upload profile picture to Cloudinary if provided
    let userProfileImageUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await profilePictureUpload.uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      userProfileImageUrl = uploadResult.url;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const user = new User({
      profilePicture: userProfileImageUrl,
      userName,
      email,
      password: hashedPassword,
      phone,
      address,
      cart,
      favorites,
      orders,
      role: "USER",
    });

    // Save the user to the database
    await user.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    // Handle server errors
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password!",
      });
    }

    // Generate a JWT token
    const payload = {
      role: "USER",
      user: {
        id: user.id,
        email: user.email,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error Generating Token!",
        });
      }

      // Return success response with the token
      res.json({
        success: true,
        message: "User Login Successfully",
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
        token,
      });
    });
  } catch (err) {
    // Handle server errors
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Logging In!",
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from the request parameters

    // Find the user by ID and exclude the password field
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    // Return success response with the user details
    res.json({
      success: true,
      message: "User Fetched Successfully",
      user: user,
    });
  } catch (err) {
    // Handle server errors
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting User!",
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "No User Found!",
      });
    }

    res.json({
      success: true,
      message: "User Fetched Successfully",
      patients,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Fetching Users!",
    });
  }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find the user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (err) {
    // Handle server errors
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Resetting Password!",
    });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    let user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Update other fields
    if (req.body.userName) user.userName = req.body.userName;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;

    // Handle Profile Picture Upload
    if (req.files && req.files.profilePicture) {
      const newProfilePicture = req.files.profilePicture[0]; // Get the uploaded file

      if (user.profilePicture) {
        try {
          // Extract public ID from the existing Cloudinary URL
          const publicId = user.profilePicture.split("/").pop().split(".")[0];

          // Delete old profile picture from Cloudinary
          await cloudinary.uploader.destroy(
            `BookHeaven/profilePictures/${publicId}`
          );
        } catch (error) {
          console.error("❌ Error deleting old profile picture:", error);
        }
      }

      // Upload new profile picture to Cloudinary
      const result = await uploadToCloudinary(
        newProfilePicture,
        "profilePicture"
      );

      // Update the user's profile picture URL
      user.profilePicture = result.url;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User Updated Successfully.",
      user,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Logout user
exports.logoutUser = async (req, res, next) => {
  try {
    // Return success response with a null token
    res.status(200).json({
      success: true,
      message: "Logout SuccessFully!",
      token: null,
    });
  } catch (err) {
    // Handle server errors
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    // Delete profile picture from Cloudinary
    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(
          `BookHeaven/profilePictures/${publicId}`
        );
      } catch (error) {
        console.error("❌ Error deleting profile picture:", error);
      }
    }

    // Delete all orders of the user
    await Order.deleteMany({ userId: id });

    // No need to delete library separately since it's embedded in user

    // Finally delete the user document (cart, favorites, library will be deleted too)
    await User.findByIdAndDelete(id);

    res.status(201).json({
      success: true,
      message: "User profile and all associated data deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Error deleting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// get library
exports.getLibrary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "library.bookId",
      "title author bookImage"
    ); // Add fields as needed

    res.status(200).json({ success: true, library: user.library });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
