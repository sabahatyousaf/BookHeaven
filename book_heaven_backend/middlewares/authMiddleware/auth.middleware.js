const jwt = require("jsonwebtoken");
const SuperAdmin = require("../../models/super-admin.model");
const User = require("../../models/user.model");

// Authentication middleware to verify JWT tokens and authorize users
const authMiddleware = async (req, res, next) => {
  try {
    // Extract the Authorization header from the request
    const authHeader = req.header("Authorization");

    // Check if the Authorization header is missing or doesn't start with "Bearer "
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access, Token is missing",
      });
    }

    // Extract the JWT token from the Authorization header
    const jwtToken = authHeader.split(" ")[1];

    // Verify the JWT token using the secret key
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Check if the decoded token has the required structure (user ID and role)
    if (!decodedToken?.user?.id || !decodedToken?.role) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Token Structure" });
    }

    // Determine the user model (SuperAdmin or User) based on the role in the token
    const userModel = decodedToken.role === "SUPERADMIN" ? SuperAdmin : User;

    // Find the user in the database by ID and exclude the password field
    const user = await userModel
      .findById(decodedToken.user.id)
      .select("-password");

    // If the user is not found, return a 404 error
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    // Attach the user details to the request object for use in subsequent middleware or routes
    req.user = {
      id: user._id.toString(), // User ID
      role: decodedToken.role, // User role (SUPERADMIN or USER)
      email: user.email, // User email
    };

    // Explicitly set userId on the request object for convenience
    req.userId = user._id.toString();

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle errors during token verification (e.g., invalid or expired token)
    console.error("❌ Error Verifying Token:", error.message || error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or Expired Token" });
  }
};

// Export the middleware for use in other parts of the application
module.exports = authMiddleware;
