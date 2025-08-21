const bcrypt = require("bcrypt");
const SuperAdmin = require("../models/super-admin.model");
const profilePictureUpload = require("../utilities/cloudinary/cloudinary.utility");
const jwt = require("jsonwebtoken");

// Register a new SuperAdmin
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Check if a SuperAdmin with the same email already exists
    const existingSuperAdmin = await SuperAdmin.findOne({
      email,
      role: "SUPERADMIN",
    });

    if (existingSuperAdmin) {
      return res.status(409).json({
        success: false,
        message: "SuperAdmin with this email already exists",
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

    // Create a new SuperAdmin instance
    const superAdmin = new SuperAdmin({
      profilePicture: userProfileImageUrl,
      userName,
      email,
      password: hashedPassword,
      role: "SUPERADMIN",
      isSuperAdmin: true,
    });

    // Save the SuperAdmin to the database
    await superAdmin.save();

    // Return success response
    res.status(200).json({
      success: true,
      message: "SuperAdmin created successfully",
    });
  } catch (error) {
    // Handle server errors
    console.error("Error creating super admin:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login SuperAdmin
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the SuperAdmin by email
    let superadmin = await SuperAdmin.findOne({ email });
    if (!superadmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin Not Found!",
      });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password!",
      });
    }

    // Generate a JWT token
    const payload = {
      role: "SUPERADMIN",
      user: {
        id: superadmin.id,
        email: superadmin.email,
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
        message: "Super Admin Login Successfully",
        data: {
          id: superadmin.id,
          userName: superadmin.userName,
          email: superadmin.email,
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

// Get SuperAdmin by ID
exports.getSuperAdminById = async (req, res) => {
  try {
    const { id } = req.params; // Extract SuperAdmin ID from the request parameters

    // Find the SuperAdmin by ID and exclude the password field
    const superAdmin = await SuperAdmin.findById(id).select("-password");
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin Not Found!",
      });
    }

    // Return success response with the SuperAdmin details
    res.json({
      success: true,
      message: "Super Admin Fetched Successfully",
      superAdmin: superAdmin,
    });
  } catch (err) {
    // Handle server errors
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error Getting Super Admin!",
    });
  }
};

// Reset SuperAdmin password
exports.resetSuperAdminPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find the SuperAdmin by email
    let superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: "Super Admin Not Found!",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the SuperAdmin's password
    superAdmin.password = hashedPassword;
    await superAdmin.save();

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

// Logout SuperAdmin
exports.logoutSuperAdmin = async (req, res, next) => {
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

// Get all users (SuperAdmin only)
exports.getUsers = async (req, res) => {
  try {
    const { email } = req.query; // Extract email from the query parameters

    // Find users by email
    const users = await User.find({ email });

    // Return success response with the list of users
    res.status(200).json({
      success: true,
      message: `${email} users fetched successfully!`,
      users: users,
    });
  } catch (error) {
    // Handle server errors
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
